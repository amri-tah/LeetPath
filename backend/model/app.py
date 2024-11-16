# Copyright 2015 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_flex_quickstart]

from flask import Flask, request, jsonify
import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import networkx as nx
import requests

app = Flask(__name__)

class QuestionRecommender:
    def __init__(self, file_path="data.json"):
        self.df = self.load_and_preprocess_data(file_path)
        self.similarity_matrix = None
        self.topic_matrix = None
        self.potential_matrix = None
        self.mrf = None
        self.G = None
        self.user_skill_levels = self.load_user_skill_levels() 
        self.user_solved_problems = {} 
        self.timeout_problems = {}

        # Pre-calculate matrices and graph once
        self.calculate_similarity_matrix()
        self.calculate_topic_matrix()
        self.calculate_potential_matrix()
        self.build_graph()

    def load_and_preprocess_data(self, file_path):
        df = pd.read_json(file_path)
        df = self.preprocess_data(df)
        return df

    def preprocess_data(self, df):
        scaler = MinMaxScaler()
        df[['likability', 'accuracy']] = scaler.fit_transform(df[['likability', 'accuracy']])
        return df

    def load_user_skill_levels(self):
        # Load the user skill levels from a JSON file
        return requests.get("https://leetpath-go.onrender.com/emails-skills").json()

    def calculate_similarity_matrix(self):
        question_vectors = TfidfVectorizer().fit_transform(self.df['question'])
        self.similarity_matrix = cosine_similarity(question_vectors)

    def calculate_topic_matrix(self):
        self.topic_matrix = self.custom_topic_model(self.df['question'].tolist(), n_topics=3)

    def calculate_potential_matrix(self):
        joint_prob = pd.crosstab(self.df['accuracy'], self.df['difficulty'], normalize='all')
        self.potential_matrix = np.zeros((2, 3))

        for acc in range(2):
            for diff in range(1, 4):
                if diff in joint_prob.columns:
                    self.potential_matrix[acc, diff - 1] = joint_prob.loc[acc, diff] if acc in joint_prob.index else 0

    class MarkovRandomField:
        def __init__(self):
            self.edges = {}
            self.nodes = {}
            self.potentials = {}

        def add_edge(self, node1, node2, potential):
            if node1 not in self.nodes:
                self.nodes[node1] = {}
            if node2 not in self.nodes:
                self.nodes[node2] = {}

            self.potentials[(node1, node2)] = potential

        def compute_potential(self, node1, node2, val1, val2):
            return self.potentials[(node1, node2)][val1, val2]

    def belief_propagation(self, mrf, max_iter=10):
        messages = {}

        # Initialize messages
        for (node1, node2) in mrf.edges:
            messages[(node1, node2)] = np.ones(2)  # Uniform initialization for binary values (0, 1)

        for _ in range(max_iter):
            for (node1, node2) in mrf.edges:
                incoming_messages = np.prod([messages[(nbr, node1)] for nbr in mrf.nodes[node1] if nbr != node2], axis=0)

                for val1 in range(2):
                    for val2 in range(3):
                        messages[(node1, node2)] = mrf.compute_potential(node1, node2, val1, val2)

        return messages

    def custom_topic_model(self, corpus, n_topics=2, alpha=0.1, beta=0.01):
        vocab = {word: idx for idx, word in enumerate(set(' '.join(corpus).split()))}
        word_topic_matrix = np.zeros((len(vocab), n_topics))
        doc_topic_matrix = np.zeros((len(corpus), n_topics))

        doc_word_topic = []
        for i, doc in enumerate(corpus):
            topics = []
            for word in doc.split():
                topic = np.random.randint(0, n_topics)
                topics.append(topic)
                word_topic_matrix[vocab[word], topic] += 1
                doc_topic_matrix[i, topic] += 1
            doc_word_topic.append(topics)

        for _ in range(50):
            for d, doc in enumerate(corpus):
                for i, word in enumerate(doc.split()):
                    topic = doc_word_topic[d][i]
                    word_topic_matrix[vocab[word], topic] -= 1
                    doc_topic_matrix[d, topic] -= 1

                    topic_dist = (word_topic_matrix[vocab[word], :] + beta) * (doc_topic_matrix[d, :] + alpha)
                    new_topic = np.argmax(topic_dist / topic_dist.sum())

                    doc_word_topic[d][i] = new_topic
                    word_topic_matrix[vocab[word], new_topic] += 1
                    doc_topic_matrix[d, new_topic] += 1

        return doc_topic_matrix / doc_topic_matrix.sum(axis=1, keepdims=True)

    def topic_overlap(self, doc1_topics, doc2_topics):
        return np.sum(np.minimum(doc1_topics, doc2_topics))

    def build_graph(self):
        self.G = nx.Graph()
        for idx, row in self.df.iterrows():
            self.G.add_node(row['titleSlug'], difficulty=row['difficulty'], likability=row['likability'], accuracy=row['accuracy'])

        for i in range(len(self.df)):
            for j in range(i + 1, len(self.df)):
                prob = np.random.random()  
                content_similarity = self.similarity_matrix[i, j]
                topic_overlap_score = self.topic_overlap(self.topic_matrix[i], self.topic_matrix[j])

                combined_weight = (content_similarity + topic_overlap_score) / 2
                self.G.add_edge(self.df.loc[i, 'titleSlug'], self.df.loc[j, 'titleSlug'], weight=combined_weight)

    def recommend_questions(self, user_id, solved_questions, top_n=3):
        # Initialize user skill level if not already set
        if user_id not in self.user_skill_levels:
            self.user_skill_levels[user_id] = 1  # Starting skill level

        recommendations = {}

        for solved in solved_questions:
            if solved not in self.G:
                continue
            neighbors = sorted(self.G[solved].items(), key=lambda x: x[1]['weight'], reverse=True)
            for neighbor, _ in neighbors:
                if neighbor not in solved_questions and neighbor not in self.timeout_problems.get(user_id, []):
                    problem_difficulty = self.df[self.df['titleSlug'] == neighbor]['difficulty'].values[0]
                    # Map difficulty to skill level (adjust as per requirements)
                    mapped_difficulty = self.difficulty_to_skill_level(problem_difficulty)

                    # Only recommend problems that match user's current skill level
                    if mapped_difficulty <= self.user_skill_levels[user_id]:
                        recommendations[neighbor] = self.G[solved][neighbor]['weight']

        sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)

        # Perform belief propagation to adjust the recommendations
        self.mrf = self.MarkovRandomField()
        self.mrf.add_edge('accuracy', 'difficulty', self.potential_matrix)

        # Update belief propagation for each recommendation
        cpt = self.belief_propagation(self.mrf)

        # Adjust recommendations using belief propagation output
        adjusted_recommendations = []
        for rec, _ in sorted_recommendations[:top_n]:
            # Modify recommendation score using belief propagation (CPT output)
            adjustment_factor = cpt.get(('accuracy', 'difficulty'), 1)
            adjusted_recommendations.append((rec, adjustment_factor))

        return adjusted_recommendations[:top_n]

    def difficulty_to_skill_level(self, difficulty):
        # Map problem difficulty (1-5) to a skill level (1-100)
        skill_mapping = {1: 20, 2: 40, 3: 60, 4: 80, 5: 100}  # Customize as needed
        return skill_mapping.get(difficulty, 50)

    def update_skill_level(self, user_id, problem, solved):
        # Update user skill level after solving or timing out a problem based on difficulty
        problem_difficulty = self.df[self.df['titleSlug'] == problem]['difficulty'].values[0]
        skill_increment = self.difficulty_to_skill_level(problem_difficulty)

        if solved:
            self.user_skill_levels[user_id] += skill_increment
        else:
            # If timed out, decrease skill slightly
            self.user_skill_levels[user_id] -= skill_increment / 2

        self.user_skill_levels[user_id] = np.minimum(self.user_skill_levels[user_id], 100)
        self.user_skill_levels[user_id] = np.maximum(self.user_skill_levels[user_id], 1)
        UPDATE_USER_URL = "https://leetpath-go.onrender.com/updateUser"
        response = requests.post(UPDATE_USER_URL, json={"email": user_id, "skill": self.user_skill_levels[user_id]})
        response.raise_for_status()


print("Loading  Model....")
recommender = QuestionRecommender(file_path="data.json")
print("Model Loaded....")
print("API Initialized....")

@app.route("/", methods=["GET"])
def home():
    return "API is Runnning on Google Cloud"

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        user_id = data.get('email')
        solved_questions = data.get('solved_questions', [])

        if not user_id or not isinstance(solved_questions, list):
            return jsonify({"error": "Invalid input data. Provide 'email' and 'solved_questions' list."}), 400

        recommendations = recommender.recommend_questions(user_id, solved_questions)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(debug=True)

# [END gae_flex_quickstart]