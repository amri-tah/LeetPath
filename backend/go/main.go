package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"
)

var db *mongo.Database

type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Email       string             `json:"email" binding:"required"`
	Username    string             `json:"username,omitempty"`
	Name        string             `json:"name,omitempty"`
	Solved      Solved             `json:"solved,omitempty"`
	Institution string             `json:"institution,omitempty"`
	Status      bool               `json:"status,omitempty"`
}

type Solved struct {
	Easy   int `json:"easy,omitempty"`
	Medium int `json:"medium,omitempty"`
	Hard   int `json:"hard,omitempty"`
}

type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables"`
}

type QuestionListResponse struct {
	Data struct {
		ProblemsetQuestionList struct {
			Total     int `json:"total"`
			Questions []struct {
				AcRate             float64 `json:"acRate"`
				Difficulty         string  `json:"difficulty"`
				FreqBar            float64 `json:"freqBar"`
				FrontendQuestionId string  `json:"frontendQuestionId"`
				IsFavor            bool    `json:"isFavor"`
				PaidOnly           bool    `json:"paidOnly"`
				Status             string  `json:"status"`
				Title              string  `json:"title"`
				TitleSlug          string  `json:"titleSlug"`
				TopicTags          []struct {
					Name string `json:"name"`
					Id   string `json:"id"`
					Slug string `json:"slug"`
				} `json:"topicTags"`
				HasSolution      bool `json:"hasSolution"`
				HasVideoSolution bool `json:"hasVideoSolution"`
			} `json:"questions"`
		} `json:"problemsetQuestionList"`
	} `json:"data"`
}

func fetchQuestions(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit parameter"})
		return
	}

	variables := map[string]interface{}{
		"categorySlug": "",
		"skip":         0,
		"limit":        limit,
		"filters":      map[string]interface{}{},
	}
	query := `
	query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
	  problemsetQuestionList: questionList(
		categorySlug: $categorySlug
		limit: $limit
		skip: $skip
		filters: $filters
	  ) {
		total: totalNum
		questions: data {
		  acRate
		  difficulty
		  freqBar
		  frontendQuestionId: questionFrontendId
		  isFavor
		  paidOnly: isPaidOnly
		  status
		  title
		  titleSlug
		  topicTags {
			name
			id
			slug
		  }
		  hasSolution
		  hasVideoSolution
		}
	  }
	}`

	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		log.Printf("Error marshalling request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	req, err := http.NewRequest("POST", "https://leetcode.com/graphql", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("Error creating request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	var response QuestionListResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		log.Printf("Error unmarshalling response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, response.Data.ProblemsetQuestionList)
}

func getStats(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid email"})
		return
	}

	var user User
	err := db.Collection("user").FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": false, "message": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "userStats": user.Solved})
}

func getProblemData(c *gin.Context) {
	var request struct {
		TitleSlug string `json:"titleSlug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "TitleSlug is required"})
		return
	}

	apiURL := fmt.Sprintf("https://alfa-leetcode-api.onrender.com/select?titleSlug=%s", request.TitleSlug)

	resp, err := http.Get(apiURL)
	if err != nil || resp.StatusCode != http.StatusOK {
		log.Printf("Error fetching data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving problem data"})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading response data"})
		return
	}

	var problemData struct {
		Link             string `json:"link"`
		QuestionId       string `json:"questionId"`
		QuestionTitle    string `json:"questionTitle"`
		TitleSlug        string `json:"titleSlug"`
		Difficulty       string `json:"difficulty"`
		Question         string `json:"question"`
		ExampleTestcases string `json:"exampleTestcases"`
		TopicTags        []struct {
			Name string `json:"name"`
			Slug string `json:"slug"`
		} `json:"topicTags"`
		Hints []string `json:"hints"`
	}

	if err := json.Unmarshal(body, &problemData); err != nil {
		log.Printf("Error unmarshalling response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing response data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"link":             problemData.Link,
		"questionId":       problemData.QuestionId,
		"questionTitle":    problemData.QuestionTitle,
		"titleSlug":        problemData.TitleSlug,
		"difficulty":       problemData.Difficulty,
		"question":         problemData.Question,
		"exampleTestcases": problemData.ExampleTestcases,
		"topicTags":        problemData.TopicTags,
		"hints":            problemData.Hints,
	})
}

func initDatabase() (*mongo.Database, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		log.Fatal("MONGO_URI environment variable not set")
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(context.TODO(), opts)
	if err != nil {
		return nil, fmt.Errorf("error creating MongoDB client: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := client.Database("admin").RunCommand(ctx, bson.D{{"ping", 1}}).Err(); err != nil {
		return nil, fmt.Errorf("error connecting to MongoDB: %w", err)
	}

	fmt.Println("Pinged your deployment. Successfully connected to MongoDB!")
	return client.Database("Weed"), nil
}

func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

func getUserData(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid email"})
		return
	}

	var user User
	err := db.Collection("user").FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": false, "message": "User not found"})
		return
	}

	user.Status = true
	c.JSON(http.StatusOK, user)
}

func addUser(c *gin.Context) {
	var user User

	if err := c.ShouldBindJSON(&user); err != nil || !isValidEmail(user.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid email or missing fields"})
		return
	}

	// Set default values if fields are missing
	if user.Username == "" {
		atIndex := len(user.Email)
		if idx := regexp.MustCompile(`@`).FindStringIndex(user.Email); idx != nil {
			atIndex = idx[0]
		}
		user.Username = user.Email[:atIndex] // Use part of email as username
	}

	if user.Name == "" {
		user.Name = "N/A" // Default value for Name
	}

	if user.Institution == "" {
		user.Institution = "N/A" // Default value for Institution
	}

	if user.Solved == (Solved{}) { // Check if Solved is empty
		user.Solved = Solved{
			Easy:   0,
			Medium: 0,
			Hard:   0,
		}
	}

	// Insert the user into the database
	result, err := db.Collection("user").InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": "Server error"})
		return
	}

	// Respond with the created user ID
	c.JSON(http.StatusCreated, gin.H{"status": true, "inserted_id": result.InsertedID})
}

func updateUser(c *gin.Context) {
	var updateData map[string]interface{}
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid request body"})
		return
	}

	email, exists := updateData["email"].(string)
	if !exists || !isValidEmail(email) {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid or missing email"})
		return
	}
	delete(updateData, "email")

	newUsername, usernameExists := updateData["username"].(string)
	if usernameExists {
		var existingUser User
		err := db.Collection("user").FindOne(context.Background(), bson.M{"username": newUsername}).Decode(&existingUser)
		if err == nil && existingUser.Email != email {
			delete(updateData, "username")
			c.JSON(http.StatusConflict, gin.H{"status": false, "message": "Username already exists"})
			return
		}
	}

	update := bson.M{"$set": updateData}
	collection := db.Collection("user")
	result, err := collection.UpdateOne(context.Background(), bson.M{"email": email}, update)
	if err != nil {
		log.Printf("Error updating user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": "Error updating user data"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"status": false, "message": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "message": "User data updated"})
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func main() {
	var err error
	db, err = initDatabase()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(corsMiddleware())
	router.PATCH("/updateUser", updateUser)
	router.POST("/getUserData", getUserData)
	router.POST("/addUser", addUser)
	router.POST("/problemSet", fetchQuestions)
	router.POST("/problemData", getProblemData)
	router.POST("/getStats", getStats)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
