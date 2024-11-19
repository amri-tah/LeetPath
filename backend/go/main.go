package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db *mongo.Database

type User struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Email            string             `json:"email" binding:"required"`
	Username         string             `json:"username,omitempty"`
	Name             string             `json:"name,omitempty"`
	Solved           Solved             `json:"solved,omitempty"`
	Institution      string             `json:"institution,omitempty"`
	Status           bool               `json:"status,omitempty"`
	LeetcodeUsername string             `json:"leetcode_username,omitempty"`
	SolvedQuestions  []string           `json:"solved_questions,omitempty"`
}

type Solved struct {
	Easy   int `json:"easy,omitempty"`
	Medium int `json:"medium,omitempty"`
	Hard   int `json:"hard,omitempty"`
}

// Graph QL
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

func getSolvedQuestionsByEmail(c *gin.Context) {
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

	if len(user.SolvedQuestions) == 0 {
		user.SolvedQuestions = []string{"two-sum"} // Default value
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "solved_questions": user.SolvedQuestions})
}

func addSolvedQuestion(c *gin.Context) {
	var req struct {
		Email        string `json:"email" binding:"required"`
		QuestionSlug string `json:"question_slug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid email or question slug"})
		return
	}

	var user User
	err := db.Collection("user").FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": false, "message": "User not found"})
		return
	}

	// Add question to the SolvedQuestions list if not already present
	for _, q := range user.SolvedQuestions {
		if q == req.QuestionSlug {
			c.JSON(http.StatusConflict, gin.H{"status": false, "message": "Question already solved"})
			return
		}
	}
	user.SolvedQuestions = append(user.SolvedQuestions, req.QuestionSlug)

	// Update the user in the database
	_, err = db.Collection("user").UpdateOne(
		context.Background(),
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{"solvedquestions": user.SolvedQuestions}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": "Failed to update solved questions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "message": "Question added to solved list"})
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

func getProblemData(c *gin.Context) {
	var request struct {
		TitleSlug string `json:"titleSlug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "TitleSlug is required"})
		return
	}

	query := `query selectProblem($titleSlug: String!) {
		question(titleSlug: $titleSlug) {
			questionId
			questionFrontendId
			title
			titleSlug
			content
			difficulty
			exampleTestcases
			topicTags {
				name
				slug
			}
			hints
		}
	}`

	payload := map[string]interface{}{
		"query": query,
		"variables": map[string]string{
			"titleSlug": request.TitleSlug,
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshalling payload: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating request payload"})
		return
	}

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil || resp.StatusCode != http.StatusOK {
		log.Printf("Error making request: %v", err)
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

	var graphqlResponse struct {
		Data struct {
			Question struct {
				QuestionId       string `json:"questionId"`
				Title            string `json:"title"`
				TitleSlug        string `json:"titleSlug"`
				Difficulty       string `json:"difficulty"`
				Content          string `json:"content"`
				ExampleTestcases string `json:"exampleTestcases"`
				TopicTags        []struct {
					Name string `json:"name"`
					Slug string `json:"slug"`
				} `json:"topicTags"`
				Hints []string `json:"hints"`
			} `json:"question"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &graphqlResponse); err != nil {
		log.Printf("Error unmarshalling response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing response data"})
		return
	}

	question := graphqlResponse.Data.Question
	c.JSON(http.StatusOK, gin.H{
		"questionId":       question.QuestionId,
		"questionTitle":    question.Title,
		"titleSlug":        question.TitleSlug,
		"difficulty":       question.Difficulty,
		"content":          question.Content,
		"exampleTestcases": question.ExampleTestcases,
		"topicTags":        question.TopicTags,
		"hints":            question.Hints,
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

func fetchLeetcodeStats(username string) (Solved, error) {
	query := `
	query getUserProfile($username: String!) {
		matchedUser(username: $username) {
			submitStats {
				acSubmissionNum {
					difficulty
					count
				}
			}
		}
	}`

	variables := map[string]string{"username": username}
	payload := map[string]interface{}{
		"query":     query,
		"variables": variables,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return Solved{}, fmt.Errorf("failed to serialize GraphQL payload: %v", err)
	}

	resp, err := http.Post("https://leetcode.com/graphql", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return Solved{}, fmt.Errorf("error sending request to LeetCode: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return Solved{}, fmt.Errorf("LeetCode API error: %s", string(body))
	}

	var response struct {
		Data struct {
			MatchedUser struct {
				SubmitStats struct {
					AcSubmissionNum []struct {
						Difficulty string `json:"difficulty"`
						Count      int    `json:"count"`
					} `json:"acSubmissionNum"`
				} `json:"submitStats"`
			} `json:"matchedUser"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return Solved{}, fmt.Errorf("failed to decode LeetCode response: %v", err)
	}

	stats := response.Data.MatchedUser.SubmitStats.AcSubmissionNum
	solved := Solved{}
	for _, stat := range stats {
		switch stat.Difficulty {
		case "Easy":
			solved.Easy = stat.Count
		case "Medium":
			solved.Medium = stat.Count
		case "Hard":
			solved.Hard = stat.Count
		}
	}
	return solved, nil
}

func updateSolvedWithLeetCode(c *gin.Context) {
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

	if user.LeetcodeUsername == "" {
		c.JSON(http.StatusOK, gin.H{"status": true, "message": "LeetCode username not provided, skipping update"})
		return
	}

	solved, err := fetchLeetcodeStats(user.LeetcodeUsername)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": fmt.Sprintf("Error fetching LeetCode stats: %v", err)})
		return
	}

	_, err = db.Collection("user").UpdateOne(
		context.Background(),
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{"solved": solved}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": "Error updating solved stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "message": "Solved stats updated", "solved": solved})
}

func removeSolvedQuestion(c *gin.Context) {
	var req struct {
		Email        string `json:"email" binding:"required"`
		QuestionSlug string `json:"question_slug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Invalid email or question slug"})
		return
	}

	filter := bson.M{"email": req.Email}
	update := bson.M{"$pull": bson.M{"solvedquestions": req.QuestionSlug}}

	result, err := db.Collection("user").UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": "Failed to remove solved question"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"status": false, "message": "User not found or question not in solved list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "message": "Question removed from solved list"})
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

	if user.Solved == (Solved{}) {
		user.Solved = Solved{Easy: 0, Medium: 0, Hard: 0}
	}

	c.JSON(http.StatusOK, gin.H{"status": true, "userStats": user.Solved, "solved_questions": user.SolvedQuestions})
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
	router.POST("/getSolvedQuestions", getSolvedQuestionsByEmail)
	router.POST("/addSolvedQuestion", addSolvedQuestion)
	router.POST("/getUserData", getUserData)
	router.POST("/addUser", addUser)
	router.POST("/problemSet", fetchQuestions)
	router.POST("/problemData", getProblemData)
	router.POST("/getStats", getStats)
	router.POST("/updateSolvedWithLeetCode", updateSolvedWithLeetCode)
	router.POST("/removeSolvedQuestion", removeSolvedQuestion)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
