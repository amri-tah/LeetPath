# import requests

# # Define the URL for the API
# url = 'http://127.0.0.1:5000/getUserData'

# # Define the payload to get the user by email
# data = {
#     "email": "vishalatmadurai@gmail.com"
# }

# # Send a GET request to the getUserData route
# response = requests.post(url, json=data)

# # Print the response from the server
# print("Status Code:", response.status_code)
# print("Response JSON:", response.json())


# import requests

# # Define the URL for the API
# url = 'http://127.0.0.1:5000/addUser'
 
# # Define the payload with the required fields
# data = {
#     "email": "testuser@example.com",
#     "username": "testuser",
#     "name": "Test User",
#     "solved": {
#         "easy" : 10, 
#         "medium" : 20, 
#         "hard" : 2
#     },
#     "institution": "Test University"
# }

# # Send a POST request to the addUser route
# response = requests.post(url, json=data)

# # Print the response from the server
# print("Status Code:", response.status_code)
# print("Response JSON:", response.json())



#
#
# API Test
#
#

import requests
import time

BASE_URL = "http://localhost:8080"  # Replace with the actual API base URL


def test_add_user():
    url = f"{BASE_URL}/addUser"
    data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "name": "Test User",
        "institution": "Test Institution",
        "leetcode_username": "test_leetcode_user"
    }
    response = requests.post(url, json=data)
    print("Add User Response:", response.json())


def test_get_user_data():
    url = f"{BASE_URL}/getUserData"
    data = {"email": "testuser@example.com"}
    response = requests.post(url, json=data)
    print("Get User Data Response:", response.json())


def test_add_solved_question():
    url = f"{BASE_URL}/addSolvedQuestion"
    data = {
        "email": "testuser@example.com",
        "question_slug": "two-sum"
    }
    response = requests.post(url, json=data)
    print("Add Solved Question Response:", response.json())


def test_get_solved_questions():
    url = f"{BASE_URL}/getSolvedQuestions"
    data = {"email": "testuser@example.com"}
    response = requests.post(url, json=data)
    print("Get Solved Questions Response:", response.json())


def test_update_solved_with_leetcode():
    url = f"{BASE_URL}/updateSolvedWithLeetCode"
    data = {"email": "testuser@example.com"}
    response = requests.post(url, json=data)
    print("Update Solved with LeetCode Response:", response.json())


def test_remove_solved_question():
    url = f"{BASE_URL}/removeSolvedQuestion"
    data = {
        "email": "testuser@example.com",
        "question_slug": "two-sum"
    }
    response = requests.post(url, json=data)
    print("Remove Solved Question Response:", response.json())


def test_get_stats():
    url = f"{BASE_URL}/getStats"
    data = {"email": "testuser@example.com"}
    response = requests.post(url, json=data)
    print("Get Stats Response:", response.json())


def test_problem_data():
    url = f"{BASE_URL}/problemData"
    data = {"titleSlug": "two-sum"}
    response = requests.post(url, json=data)
    print("Problem Data Response:", response.json())


def test_problem_set():
    url = f"{BASE_URL}/problemSet?limit=10"
    response = requests.post(url)
    print("Problem Set Response:", response.json())


def test_update_user():
    url = f"{BASE_URL}/updateUser"
    data = {
        "email": "testuser@example.com",
        "username": "updateduser",
        "name": "Updated Name"
    }
    response = requests.patch(url, json=data)
    print("Update User Response:", response.json())


if __name__ == "__main__":
    print("Testing API Endpoints...\n")
    test_add_user()
    time.sleep(2)  # Wait for 2 seconds

    test_get_user_data()
    time.sleep(2)

    test_add_solved_question()
    time.sleep(2)

    test_get_solved_questions()
    time.sleep(2)

    test_update_solved_with_leetcode()
    time.sleep(2)

    test_remove_solved_question()
    time.sleep(2)

    test_get_stats()
    time.sleep(2)

    test_problem_data()
    time.sleep(2)

    test_problem_set()
    time.sleep(2)

    test_update_user()
