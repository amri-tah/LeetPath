import json
import requests
from collections import defaultdict

"""
API Credits : https://github.com/alfaarghya/alfa-leetcode-api

Replace with https://alfa-leetcode-api.onrender.com/

But it has a rate limit. It's better to clone it and run it locally to collect the data. 
Remove the rate limiter in src/app.ts before running it locally. 
"""

API_BASE_URL = "http://localhost:3000/"

def getProblemData(limit):
    problemData = defaultdict(dict)
    allProblems = requests.get(API_BASE_URL + f"problems?limit={limit}").json()
    for problem in allProblems["problemsetQuestionList"]: 
        id = int(problem["questionFrontendId"])
        # Data from Problem List
        problemData[id]["accuracy"] = problem["acRate"]
        problemData[id]["title"] = problem["title"]
        problemData[id]["titleSlug"] = problem["titleSlug"]
        problemData[id]["topics"] = [x["slug"] for x in problem["topicTags"]]
        problemData[id]["difficulty"] = problem["difficulty"].lower()

        # Data from Problem Info
        problem = requests.get(API_BASE_URL + f"select?titleSlug={problem["titleSlug"]}").json()
        problemData[id]["questionId"] = problem["questionId"]
        problemData[id]["questionFrontendId"] = problem["questionFrontendId"]
        problemData[id]["question"] = problem["question"]
        problemData[id]["link"] = problem["link"]
        problemData[id]["likes"] = problem["likes"]
        problemData[id]["dislikes"] = problem["dislikes"]
        problemData[id]["likability"] = (problem["likes"]/(problem["likes"]+problem["dislikes"]))*100

    with open("data.json", "w+") as f:
        f.write(json.dumps(problemData, indent=4))
    

if __name__ == "__main__":
    getProblemData(4000) # Replace with Number of Problems on Leetcode






