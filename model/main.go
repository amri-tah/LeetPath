package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
)

const API_BASE_URL = "https://alfa-leetcode-api.onrender.com/"

// Define the structure based on the JSON response
type Problem struct {
	ID         string  `json:"questionFrontendId"`
	Accuracy   float64 `json:"acRate"`
	Title      string  `json:"title"`
	TitleSlug  string  `json:"titleSlug"`
	Topics     []Topic `json:"topicTags"`
	Difficulty string  `json:"difficulty"`
}

type Topic struct {
	Slug string `json:"slug"`
}

type ProblemInfo struct {
	Link     string `json:"link"`
	Likes    int    `json:"likes"`
	Dislikes int    `json:"dislikes"`
}

// Main function to fetch problem data
func getProblemData(limit int) (map[int]map[string]interface{}, error) {
	problemData := make(map[int]map[string]interface{})

	// Fetch all problems
	resp, err := http.Get(fmt.Sprintf("%sproblems?limit=%d", API_BASE_URL, limit))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Parse JSON response
	var result struct {
		ProblemsetQuestionList []Problem `json:"problemsetQuestionList"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	// Process each problem
	for _, problem := range result.ProblemsetQuestionList {
		id, err := strconv.Atoi(problem.ID)
		if err != nil {
			return nil, err
		}

		// Extract topic slugs
		topics := make([]string, len(problem.Topics))
		for i, topic := range problem.Topics {
			topics[i] = topic.Slug
		}

		// Add problem details
		problemData[id] = map[string]interface{}{
			"accuracy":   problem.Accuracy,
			"title":      problem.Title,
			"titleSlug":  problem.TitleSlug,
			"topics":     topics,
			"difficulty": problem.Difficulty,
		}

		// Fetch additional problem info
		infoResp, err := http.Get(fmt.Sprintf("%sselect?titleSlug=%s", API_BASE_URL, problem.TitleSlug))
		if err != nil {
			return nil, err
		}
		defer infoResp.Body.Close()

		var problemInfo ProblemInfo
		if err := json.NewDecoder(infoResp.Body).Decode(&problemInfo); err != nil {
			return nil, err
		}

		problemData[id]["link"] = problemInfo.Link
		problemData[id]["likes"] = problemInfo.Likes
		problemData[id]["dislikes"] = problemInfo.Dislikes
	}

	return problemData, nil
}

func main() {
	limit := 10
	problemData, err := getProblemData(limit)
	if err != nil {
		fmt.Println("Error 1:", err)
		return
	}

	// Write data to a JSON file
	file, err := json.MarshalIndent(problemData, "", "    ")
	if err != nil {
		fmt.Println("Error 2:", err)
		return
	}

	if err := ioutil.WriteFile("test.json", file, 0644); err != nil {
		fmt.Println("Error 3:", err)
	} else {
		fmt.Println("Data written to test.json")
	}
}
