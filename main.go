/*
Package main implements a web server for managing handlers with WebSocket support.

The server provides RESTful endpoints for CRUD operations on handlers and maintains
active WebSocket connections. It uses PostgreSQL for persistence and includes
authentication and validation.

Key components:
- Handler management (create, read, update, delete, list)
- WebSocket connections with access token authentication
- Session-based owner validation
- Configuration via environment variables
*/
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

/*
Handler represents a service handler with its metadata.

Fields:
- ID: Unique identifier for the handler (snowflake)
- Name: Display name of the handler (max 25 chars)
- ShortDesc: Brief description (max 180 chars)
- LongDesc: Detailed description (max 1000 chars)
- AccessToken: Secret token for WebSocket authentication
- OwnerID: User ID of the handler owner
- CreatedAt: Unix timestamp of creation time
- UpdatedAt: Unix timestamp of last update time
*/
type Handler struct {
	ID          string `json:"id" gorm:"primaryKey;type:varchar(20)"`
	Name        string `json:"name" gorm:"size:255" validate:"required,max=25"`
	ShortDesc   string `json:"short_desc" gorm:"size:180" validate:"required,max=180"`
	LongDesc    string `json:"long_desc" gorm:"size:1000" validate:"max=1000"`
	AccessToken string `json:"access_token" gorm:"size:64;uniqueIndex"`
	OwnerID     string `json:"owner_id" gorm:"type:varchar(20)"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

/*
ActiveConnection represents an active WebSocket connection.

Fields:
- Conn: The WebSocket connection
- HandlerID: Associated handler ID
- OwnerID: Owner of the handler
*/
type ActiveConnection struct {
	Conn      *websocket.Conn
	HandlerID string
	OwnerID   string
}

/*
Server contains the application state and dependencies.

Fields:
- db: Database connection
- activeConns: Map of active WebSocket connections
- connMutex: Mutex for concurrent access to activeConns
- upgrader: WebSocket connection upgrader
- validator: Request validator
- node: Snowflake ID generator node
*/
type Server struct {
	db          *gorm.DB
	activeConns map[string]*ActiveConnection
	connMutex   sync.RWMutex
	upgrader    websocket.Upgrader
	validator   *validator.Validate
	node        *snowflake.Node
}

/*
NewServer initializes a new Server instance.

Parameters:
- postgresDSN: PostgreSQL connection string

Returns:
- *Server: Initialized server instance
- error: Any initialization error
*/
func NewServer(postgresDSN string) (*Server, error) {
	db, err := gorm.Open(postgres.Open(postgresDSN), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %v", err)
	}

	if err := db.AutoMigrate(&Handler{}); err != nil {
		return nil, fmt.Errorf("failed to migrate handlers table: %v", err)
	}

	validate := validator.New()

	node, err := snowflake.NewNode(rand.Int63n(1024))
	if err != nil {
		return nil, fmt.Errorf("failed to create snowflake node: %v", err)
	}

	return &Server{
		db:          db,
		activeConns: make(map[string]*ActiveConnection),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		validator: validate,
		node:      node,
	}, nil
}

/*
validateOwner checks if a session is valid and returns the owner ID.

Parameters:
- sessionID: Session identifier from request header

Returns:
- string: Owner ID if session is valid
- error: Validation error if session is invalid
*/
func (s *Server) validateOwner(sessionID string) (string, error) {
	var session struct {
		UserID string
	}
	if err := s.db.Table("sessions").Select("user_id").Where("id = ?", sessionID).First(&session).Error; err != nil {
		return "", fmt.Errorf("invalid session")
	}

	var ownerID string
	if err := s.db.Table("users").Select("id").Where("id = ?", session.UserID).Take(&ownerID).Error; err != nil {
		return "", fmt.Errorf("owner not found")
	}

	return ownerID, nil
}

/*
validateHandler validates handler fields using struct tags.

Parameters:
- handler: Handler instance to validate

Returns:
- error: Validation errors if any
*/
func (s *Server) validateHandler(handler *Handler) error {
	return s.validator.Struct(handler)
}

/*
createHandler handles POST /api/handlers to create a new handler.

The endpoint:
1. Validates session
2. Parses request body
3. Validates handler data
4. Generates ID and access token
5. Stores in database

Response:
- 201 Created: Success with created handler in body
- 400 Bad Request: Invalid data
- 401 Unauthorized: Invalid session
- 500 Internal Server Error: Database failure
*/
func (s *Server) createHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusUnauthorized)
		return
	}

	ownerID, err := s.validateOwner(sessionID)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var handler Handler
	if err := json.NewDecoder(r.Body).Decode(&handler); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := s.validateHandler(&handler); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	handler.ID = s.node.Generate().String()
	handler.AccessToken = fmt.Sprintf("%x", rand.Int63())
	handler.OwnerID = ownerID
	handler.CreatedAt = time.Now().Unix()
	handler.UpdatedAt = handler.CreatedAt

	if err := s.db.Create(&handler).Error; err != nil {
		log.Printf("Failed to create handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(handler)
}

/*
getHandler handles GET /api/handlers/{id} to retrieve a handler.

The endpoint:
1. Validates session
2. Checks ownership
3. Returns handler data

Response:
- 200 OK: Success with handler in body
- 401 Unauthorized: Invalid session
- 404 Not Found: Handler not found or not owned
- 500 Internal Server Error: Database failure
*/
func (s *Server) getHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusUnauthorized)
		return
	}

	ownerID, err := s.validateOwner(sessionID)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := mux.Vars(r)["id"]
	var handler Handler

	if err := s.db.Where("id = ? AND owner_id = ?", id, ownerID).First(&handler).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Handler not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to query handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(handler)
}

/*
updateHandler handles PUT /api/handlers/{id} to update a handler.

The endpoint:
1. Validates session
2. Checks ownership
3. Validates updates
4. Applies changes

Response:
- 204 No Content: Success
- 400 Bad Request: Invalid data
- 401 Unauthorized: Invalid session
- 404 Not Found: Handler not found or not owned
- 500 Internal Server Error: Database failure
*/
func (s *Server) updateHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusUnauthorized)
		return
	}

	ownerID, err := s.validateOwner(sessionID)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := mux.Vars(r)["id"]
	var updates Handler
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := s.validateHandler(&updates); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	var existing Handler
	if err := s.db.Where("id = ? AND owner_id = ?", id, ownerID).First(&existing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Handler not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to query handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	updates.ID = id
	updates.OwnerID = ownerID
	updates.UpdatedAt = time.Now().Unix()
	updates.AccessToken = existing.AccessToken
	updates.CreatedAt = existing.CreatedAt

	if err := s.db.Model(&Handler{}).Where("id = ? AND owner_id = ?", id, ownerID).Updates(&updates).Error; err != nil {
		log.Printf("Failed to update handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

/*
deleteHandler handles DELETE /api/handlers/{id} to remove a handler.

The endpoint:
1. Validates session
2. Checks ownership
3. Deletes handler

Response:
- 204 No Content: Success
- 401 Unauthorized: Invalid session
- 500 Internal Server Error: Database failure
*/
func (s *Server) deleteHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusUnauthorized)
		return
	}

	ownerID, err := s.validateOwner(sessionID)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := mux.Vars(r)["id"]
	if err := s.db.Where("id = ? AND owner_id = ?", id, ownerID).Delete(&Handler{}).Error; err != nil {
		log.Printf("Failed to delete handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

/*
listHandlers handles GET /api/handlers to list handlers with pagination.

Query parameters:
- search: Optional search term for name
- page: Page number (default 1)
- limit: Items per page (default 10, max 100)

Response:
- 200 OK: Paginated list of handlers
- 401 Unauthorized: Invalid session
- 500 Internal Server Error: Database failure
*/
func (s *Server) listHandlers(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusUnauthorized)
		return
	}

	ownerID, err := s.validateOwner(sessionID)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	query := r.URL.Query()
	search := strings.TrimSpace(query.Get("search"))
	page, _ := strconv.Atoi(query.Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit
	db := s.db.Model(&Handler{}).Where("owner_id = ?", ownerID)

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		db = db.Where("LOWER(name) LIKE ?", searchPattern)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		log.Printf("Failed to count handlers: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	var handlers []Handler
	if err := db.
		Order("updated_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&handlers).Error; err != nil {
		log.Printf("Failed to find handlers: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := struct {
		Data       []Handler `json:"data"`
		Total      int64     `json:"total"`
		Page       int       `json:"page"`
		TotalPages int       `json:"total_pages"`
	}{
		Data:       handlers,
		Total:      total,
		Page:       page,
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

/*
websocketHandler handles WebSocket connections at /ws.

The endpoint:
1. Validates access token
2. Checks for existing connection
3. Upgrades to WebSocket
4. Manages connection lifecycle

Query parameters:
- access_token: Required handler access token

Response:
- 101 Switching Protocols: Successful upgrade
- 400 Bad Request: Missing token
- 401 Unauthorized: Invalid token
- 409 Conflict: Existing connection
- 500 Internal Server Error: Database failure
*/
func (s *Server) websocketHandler(w http.ResponseWriter, r *http.Request) {
	accessToken := r.URL.Query().Get("access_token")
	if accessToken == "" {
		http.Error(w, "Access token required", http.StatusBadRequest)
		return
	}

	s.connMutex.Lock()
	if _, exists := s.activeConns[accessToken]; exists {
		s.connMutex.Unlock()
		http.Error(w, "Only one connection per handler allowed", http.StatusConflict)
		return
	}
	s.connMutex.Unlock()

	var handler Handler
	if err := s.db.Where("access_token = ?", accessToken).First(&handler).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Invalid access token", http.StatusUnauthorized)
			return
		}
		log.Printf("Failed to query handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusBadRequest)
		return
	}

	activeConn := &ActiveConnection{
		Conn:      conn,
		HandlerID: handler.ID,
		OwnerID:   handler.OwnerID,
	}

	s.connMutex.Lock()
	s.activeConns[accessToken] = activeConn
	s.connMutex.Unlock()

	defer func() {
		s.connMutex.Lock()
		delete(s.activeConns, accessToken)
		s.connMutex.Unlock()
		conn.Close()
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

/*
loadConfig loads configuration from environment variables.

Configuration sources:
1. .env file
2. Environment variables

Required variables:
- DB_USER
- DB_PASSWORD
- DB_NAME

Default values:
- DB_HOST: localhost
- DB_PORT: 5432
- DB_SSL_MODE: disable
*/
func loadConfig() {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}

	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_SSL_MODE", "disable")

	required := []string{"DB_USER", "DB_PASSWORD", "DB_NAME"}
	for _, key := range required {
		if viper.GetString(key) == "" {
			log.Fatalf("Required config %s not set", key)
		}
	}
}

/*
main is the application entry point.

It:
1. Loads configuration
2. Initializes database connection
3. Sets up HTTP routes
4. Starts the server
*/
func main() {
	loadConfig()

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		viper.GetString("DB_HOST"),
		viper.GetString("DB_USER"),
		viper.GetString("DB_PASSWORD"),
		viper.GetString("DB_NAME"),
		viper.GetString("DB_PORT"),
		viper.GetString("DB_SSL_MODE"))

	server, err := NewServer(dsn)
	if err != nil {
		log.Fatalf("Failed to initialize server: %v", err)
	}

	r := mux.NewRouter()
	r.HandleFunc("/api/handlers", server.createHandler).Methods("POST")
	r.HandleFunc("/api/handlers/{id}", server.getHandler).Methods("GET")
	r.HandleFunc("/api/handlers/{id}", server.updateHandler).Methods("PUT")
	r.HandleFunc("/api/handlers/{id}", server.deleteHandler).Methods("DELETE")
	r.HandleFunc("/api/handlers", server.listHandlers).Methods("GET")
	r.HandleFunc("/ws", server.websocketHandler)

	http.Handle("/", loggingMiddleware(r))

	port := ":8080"
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

/*
loggingMiddleware provides request logging.

Parameters:
- next: The next handler in the chain

Returns:
- http.Handler: Wrapped handler with logging
*/
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}
