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

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Constants
const (
	MaxKeywords         = 20
	MaxShortDescription = 180
	MaxLongDescription  = 1000
	MaxHandlerName      = 25
	SessionCookieName   = "session_token"
)

// Handler represents an API handler configuration
type Handler struct {
	ID          string   `json:"id" gorm:"primaryKey;type:uuid"`
	Name        string   `json:"name" gorm:"size:255"`
	ShortDesc   string   `json:"short_desc" gorm:"size:180"`
	IconID      string   `json:"icon_id" gorm:"size:50"`
	IsDevMode   bool     `json:"is_dev_mode"`
	Keywords    []string `json:"keywords" gorm:"type:text[]"`
	LongDesc    string   `json:"long_desc" gorm:"size:1000"`
	AccessToken string   `json:"access_token" gorm:"size:64"`
	CreatedBy   string   `json:"created_by" gorm:"size:255"`
	CreatedAt   int64    `json:"created_at"`
	UpdatedAt   int64    `json:"updated_at"`
}

// Server is the main application server
type Server struct {
	db             *gorm.DB
	sessionStore   sessions.Store
	connectedConns map[string]*websocket.Conn
	connMutex      sync.RWMutex
	upgrader       websocket.Upgrader
}

// NewServer initializes a new Server instance
func NewServer(postgresDSN string, sessionStore sessions.Store) (*Server, error) {
	db, err := gorm.Open(postgres.Open(postgresDSN), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %v", err)
	}

	// Auto-migrate the Handler model
	if err := db.AutoMigrate(&Handler{}); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %v", err)
	}

	return &Server{
		db:             db,
		sessionStore:   sessionStore,
		connectedConns: make(map[string]*websocket.Conn),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Adjust in production
			},
		},
	}, nil
}

// getEmailFromSession extracts user email from session
func (s *Server) getEmailFromSession(r *http.Request) (string, error) {
	session, err := s.sessionStore.Get(r, SessionCookieName)
	if err != nil {
		return "", err
	}

	email, ok := session.Values["email"].(string)
	if !ok || email == "" {
		return "", fmt.Errorf("no email in session")
	}

	return email, nil
}

// validateHandler checks if handler data meets requirements
func validateHandler(handler *Handler) error {
	if len(handler.Name) > MaxHandlerName {
		return fmt.Errorf("handler name exceeds %d characters", MaxHandlerName)
	}

	if len(handler.ShortDesc) > MaxShortDescription {
		return fmt.Errorf("short description exceeds %d characters", MaxShortDescription)
	}

	if len(handler.LongDesc) > MaxLongDescription {
		return fmt.Errorf("long description exceeds %d characters", MaxLongDescription)
	}

	if len(handler.Keywords) > MaxKeywords {
		return fmt.Errorf("maximum %d keywords allowed", MaxKeywords)
	}

	for i, kw := range handler.Keywords {
		handler.Keywords[i] = strings.ToLower(strings.TrimSpace(kw))
		if strings.Contains(kw, " ") {
			return fmt.Errorf("keywords must be snake_case (no spaces)")
		}
	}

	return nil
}

// createHandler creates a new handler
func (s *Server) createHandler(w http.ResponseWriter, r *http.Request) {
	email, err := s.getEmailFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	var handler Handler
	if err := json.NewDecoder(r.Body).Decode(&handler); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := validateHandler(&handler); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Set system fields
	handler.ID = uuid.New().String()
	handler.AccessToken = fmt.Sprintf("%x", rand.Int63())
	handler.CreatedBy = email
	handler.CreatedAt = time.Now().Unix()
	handler.UpdatedAt = handler.CreatedAt

	if err := s.db.Create(&handler).Error; err != nil {
		log.Printf("Failed to insert handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(handler)
}

// getHandler retrieves a handler by ID
func (s *Server) getHandler(w http.ResponseWriter, r *http.Request) {
	email, err := s.getEmailFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := mux.Vars(r)["id"]
	var handler Handler

	result := s.db.Where("id = ? AND created_by = ?", id, email).First(&handler)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Handler not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to query handler: %v", result.Error)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(handler)
}

// updateHandler updates an existing handler
func (s *Server) updateHandler(w http.ResponseWriter, r *http.Request) {
	email, err := s.getEmailFromSession(r)
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

	if err := validateHandler(&updates); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	// First check if the handler exists and belongs to the user
	var existing Handler
	if err := s.db.Where("id = ? AND created_by = ?", id, email).First(&existing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Handler not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to query handler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Update fields
	updates.ID = id
	updates.CreatedBy = email // Ensure created_by doesn't change
	updates.UpdatedAt = time.Now().Unix()
	updates.AccessToken = existing.AccessToken // Preserve access token
	updates.CreatedAt = existing.CreatedAt     // Preserve created_at

	result := s.db.Model(&Handler{}).Where("id = ? AND created_by = ?", id, email).Updates(&updates)
	if result.Error != nil {
		log.Printf("Failed to update handler: %v", result.Error)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Handler not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// deleteHandler deletes a handler by ID
func (s *Server) deleteHandler(w http.ResponseWriter, r *http.Request) {
	email, err := s.getEmailFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := mux.Vars(r)["id"]
	result := s.db.Where("id = ? AND created_by = ?", id, email).Delete(&Handler{})
	if result.Error != nil {
		log.Printf("Failed to delete handler: %v", result.Error)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Handler not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// listHandlers lists handlers with pagination and filtering
func (s *Server) listHandlers(w http.ResponseWriter, r *http.Request) {
	email, err := s.getEmailFromSession(r)
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
	db := s.db.Model(&Handler{}).Where("created_by = ?", email)

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		db = db.Where("LOWER(name) LIKE ? OR ? = ANY(keywords)", searchPattern, strings.ToLower(search))
	}

	// Get total count for pagination
	var total int64
	if err := db.Count(&total).Error; err != nil {
		log.Printf("Failed to count handlers: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Get paginated results
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

// websocketHandler manages WebSocket connections for handlers
func (s *Server) websocketHandler(w http.ResponseWriter, r *http.Request) {
	email, err := s.getEmailFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	handlerID := r.URL.Query().Get("id")
	if handlerID == "" {
		http.Error(w, "Handler ID required", http.StatusBadRequest)
		return
	}

	// Verify the handler belongs to the user
	var count int64
	if err := s.db.Model(&Handler{}).
		Where("id = ? AND created_by = ?", handlerID, email).
		Count(&count).Error; err != nil || count == 0 {
		http.Error(w, "Handler not found", http.StatusNotFound)
		return
	}

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusBadRequest)
		return
	}

	s.connMutex.Lock()
	s.connectedConns[handlerID] = conn
	s.connMutex.Unlock()

	defer func() {
		s.connMutex.Lock()
		delete(s.connectedConns, handlerID)
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

func loadConfig() {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv() // read from environment variables

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}

	// Set defaults
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_SSL_MODE", "disable")

	// Required variables
	required := []string{"DB_USER", "DB_PASSWORD", "DB_NAME"}
	for _, key := range required {
		if viper.GetString(key) == "" {
			log.Fatalf("Required config %s not set", key)
		}
	}
}

func main() {
	loadConfig()

	// Initialize session store (use secure key in production)
	sessionStore := sessions.NewCookieStore([]byte("your-secret-key"))
	sessionStore.Options = &sessions.Options{
		HttpOnly: true,
		Secure:   true, // Enable in production with HTTPS
		SameSite: http.SameSiteStrictMode,
	}

	// Initialize server with PostgreSQL
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		viper.GetString("DB_HOST"),
		viper.GetString("DB_USER"),
		viper.GetString("DB_PASSWORD"),
		viper.GetString("DB_NAME"),
		viper.GetString("DB_PORT"),
		viper.GetString("DB_SSL_MODE"))

	server, err := NewServer(dsn, sessionStore)
	if err != nil {
		log.Fatalf("Failed to initialize server: %v", err)
	}

	// Set up routes
	r := mux.NewRouter()
	r.HandleFunc("/api/handlers", server.createHandler).Methods("POST")
	r.HandleFunc("/api/handlers/{id}", server.getHandler).Methods("GET")
	r.HandleFunc("/api/handlers/{id}", server.updateHandler).Methods("PUT")
	r.HandleFunc("/api/handlers/{id}", server.deleteHandler).Methods("DELETE")
	r.HandleFunc("/api/handlers", server.listHandlers).Methods("GET")
	r.HandleFunc("/api/ws", server.websocketHandler)

	// Add middleware for logging and recovery
	http.Handle("/", loggingMiddleware(r))

	port := ":8080"
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

// loggingMiddleware adds basic request logging
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}
