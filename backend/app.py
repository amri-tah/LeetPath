from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
from flask import Flask, render_template, jsonify, request
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def getDatabase():
    load_dotenv()
    uri = os.getenv("MONGO_URI") + "&tlsAllowInvalidCertificates=true"
    client = MongoClient(uri)
    try:
        client = MongoClient(uri)
        return client.Weed
    except:
        return None

#####################################
#                                   #
#            User Data              #
#                                   #
#####################################


@app.route('/getUserData', methods=['GET'])
def getUserData():
    db = getDatabase()
    data = request.json
    try:
        userData = db.user.find_one({"email": data["email"]})
        userData["status"] = True
        userData["_id"] = str(userData["_id"])
        return jsonify(userData)
    except Exception as e:
        print(e)
        return jsonify({"status": False})
    

@app.route('/addUser', methods=['POST'])
def addUser():
    db = getDatabase()
    data = request.json
    try:
        if not all(data.get(x, False) for x in ["email", "username", "name", "solved", "institution"]):
            return jsonify({"status": False})
        data = db.user.insert_one(data).inserted_id
        print(data)
        return jsonify({"status": True})
    except Exception as e:
        print(e)
        return jsonify({"status": False})

if __name__ == "__main__":
    app.run()