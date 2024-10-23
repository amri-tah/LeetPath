import requests

# Define the URL for the API
url = 'http://127.0.0.1:5000/getUserData'

# Define the payload to get the user by email
data = {
    "email": "vishalatmadurai@gmail.com"
}

# Send a GET request to the getUserData route
response = requests.get(url, json=data)

# Print the response from the server
print("Status Code:", response.status_code)
print("Response JSON:", response.json())


import requests

# Define the URL for the API
url = 'http://127.0.0.1:5000/addUser'

# Define the payload with the required fields
data = {
    "email": "testuser@example.com",
    "username": "testuser",
    "name": "Test User",
    "solved": {
        "easy" : 10, 
        "medium" : 20, 
        "hard" : 2
    },
    "institution": "Test University"
}

# Send a POST request to the addUser route
response = requests.post(url, json=data)

# Print the response from the server
print("Status Code:", response.status_code)
print("Response JSON:", response.json())
