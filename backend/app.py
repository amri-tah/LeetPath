from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
import json
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # In production, specify allowed origins

def getDatabase():
    load_dotenv()
    uri = os.getenv("MONGO_URI")
    if not uri:
        raise ValueError("MONGO_URI environment variable not set")
    
    client = MongoClient(uri, tlsAllowInvalidCertificates=False)  # Use False in production
    try:
        return client.Weed
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

#####################################
#            User Data              #
#####################################

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@app.route('/getUserData', methods=['POST'])
def getUserData():
    db = getDatabase()
    data = request.json
    if not data or 'email' not in data or not is_valid_email(data['email']):
        return jsonify({"status": False, "message": "Invalid email"}), 400

    try:
        userData = db.user.find_one({"email": data["email"]})
        if userData:
            userData["status"] = True
            userData["_id"] = str(userData["_id"])
            return jsonify(userData)
        else:
            return jsonify({"status": False, "message": "User not found"}), 404
    except Exception as e:
        print(f"Error retrieving user data: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500

@app.route('/addUser', methods=['POST'])
def addUser():
    db = getDatabase()
    data = request.json
    
    # Check if required fields are present
    required_fields = ["email", "username", "name", "solved", "institution"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"status": False, "message": "Missing or empty fields"}), 400
    
    # Validate email format
    if not is_valid_email(data["email"]):
        return jsonify({"status": False, "message": "Invalid email format"}), 400

    try:
        # Insert new user into the database
        inserted_id = db.user.insert_one(data).inserted_id
        print(f"Inserted user with ID: {inserted_id}")
        return jsonify({"status": True, "inserted_id": str(inserted_id)}), 201
    except Exception as e:
        print(f"Error adding user: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
