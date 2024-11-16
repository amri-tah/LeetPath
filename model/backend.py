# app.py (Flask Backend)
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import random
import json
import time

app = Flask(__name__)
CORS(app)

# Load problem data from a JSON file
with open("data.json", 'r') as file:
    problem_data = json.load(file)

class Question:
    def __init__(self, question_id, title, difficulty, accuracy, topics, question, link):
        self.question_id = question_id
        self.title = title
        self.difficulty = self.map_difficulty(difficulty)
        self.accuracy = accuracy
        self.topics = topics,
        self.question = question,
        self.link = link

    @staticmethod
    def map_difficulty(difficulty):
        return {"easy": 1, "medium": 2, "hard": 3}.get(difficulty, 0)

class User:
    def __init__(self, user_id, initial_skill=0):
        self.user_id = user_id
        self.skill = initial_skill
        self.history = []
        self.attempted_questions = set()
        self.streak = 0
        self.liked_topics = set()

class RecommenderModel:
    def __init__(self, questions, learning_rate=0.2, base_time=60):
        self.questions = questions
        self.learning_rate = learning_rate
        self.base_time = base_time

    def probability_of_solving(self, skill, difficulty):
        return 1 / (1 + np.exp(-(skill - difficulty)))

    def update_skill(self, user, difficulty, solved, time_taken):
        prob_solved = self.probability_of_solving(user.skill, difficulty)
        if solved:
            time_factor = max(0.5, min(2.0, self.base_time / (time_taken + 1)))
            skill_increase = self.learning_rate * (1 - prob_solved) * time_factor + (user.streak * 0.05)
            user.skill += skill_increase
            user.streak += 1
        else:
            user.skill -= self.learning_rate * prob_solved
            user.streak = 0
        user.skill = max(user.skill, -0.2)
        return user.skill

    def recommend_next_question(self, user):
        suitable_questions = [q for q in self.questions if q.question_id not in user.attempted_questions]
        if user.liked_topics:
            liked_topic_questions = [q for q in suitable_questions if set(q.topics).intersection(user.liked_topics)]
            if liked_topic_questions:
                suitable_questions = liked_topic_questions

        suitable_questions.sort(key=lambda q: abs(q.difficulty - user.skill))
        tolerance = 1.5 if user.skill >= 1 else 1.0
        close_questions = [q for q in suitable_questions if abs(q.difficulty - user.skill) <= tolerance]

        next_question = random.choice(close_questions) if close_questions else suitable_questions[0]
        return next_question

# Initialize data
questions = [
    Question(
        question_id=q_id,
        title=info.get("title"),
        difficulty=info.get("difficulty"),
        accuracy=info.get("accuracy"),
        topics=info.get("topics", []), 
        question = info.get("question"),
        link = info.get("link")
    )
    for q_id, info in problem_data.items()
]
user = User(user_id=1)
recommender = RecommenderModel(questions)

@app.route('/recommend', methods=['POST'])
def recommend_question():
    question = recommender.recommend_next_question(user)
    if question:
        return jsonify({
            'question_id': question.question_id,
            'title': question.title,
            'difficulty': question.difficulty,
            'topics': question.topics,
            'description': question.question,
            'link': question.link
        })
    return jsonify({'message': 'All questions attempted.'}), 404

@app.route('/attempt', methods=['POST'])
def attempt_question():
    data = request.json
    question_id = data['question_id']
    solved = data['solved']
    time_taken = data['time_taken']
    liked = data['liked']
    
    question = next((q for q in questions if q.question_id == question_id), None)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    user.skill = recommender.update_skill(user, question.difficulty, solved, time_taken)
    user.attempted_questions.add(question_id)
    if liked:
        user.liked_topics.update(set(question.topics))

    user.history.append({
        'question_id': question_id,
        'title': question.title,
        'difficulty': question.difficulty,
        'solved': solved,
        'time_taken': time_taken,
        'liked': liked,
        'updated_skill': user.skill
    })

    return jsonify({'user_skill': user.skill})

if __name__ == '__main__':
    app.run(debug=True)
