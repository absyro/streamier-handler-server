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

type ActiveConnection struct {
	Conn      *websocket.Conn
	HandlerID string
	OwnerID   string
}

type Server struct {
	db          *gorm.DB
	activeConns map[string]*ActiveConnection
	connMutex   sync.RWMutex
	upgrader    websocket.Upgrader
	validator   *validator.Validate
	node        *snowflake.Node
}

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

func (s *Server) validateHandler(handler *Handler) error {
	return s.validator.Struct(handler)
}

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

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}
