from flask import Flask, request, send_file, jsonify
import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import networkx as nx
import requests
import os
from threading import Lock
import pickle
import io
from google.cloud import storage

app = Flask(__name__)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

client = storage.Client()
bucket_name = "leetpath-images"


app = Flask(__name__)

recommender = None
recommender_lock = Lock()

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload a file to Google Cloud Storage."""
    try:
        file = request.files['file']
        blob = client.bucket(bucket_name).blob(file.filename)
        blob.upload_from_file(file)
        return jsonify({"message": f"File {file.filename} uploaded successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/delete', methods=['DELETE'])
def delete_file():
    """Delete a file from Google Cloud Storage."""
    try:
        filename = request.args.get('filename')
        blob = client.bucket(bucket_name).blob(filename)
        blob.delete()
        return jsonify({"message": f"File {filename} deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/download', methods=['POST'])
def download_file():
    """Download a file from Google Cloud Storage."""
    try:
        data = request.get_json()
        if not data or 'filename' not in data:
            return jsonify({"error": "Filename is required in the request body."}), 400

        filename = data['filename']
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(filename)

        if not blob.exists():
            return jsonify({"error": f"File '{filename}' not found in bucket '{bucket_name}'."}), 404

        # Download the file's content as bytes
        file_data = blob.download_as_bytes()

        # Create a BytesIO object from the file data
        file_stream = io.BytesIO(file_data)
        file_stream.seek(0)

        content_type = blob.content_type or 'application/octet-stream'

        return send_file(
            file_stream,
            mimetype=content_type,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/rename', methods=['POST'])
def rename_file():
    """Rename a file in Google Cloud Storage."""
    try:
        old_name = request.json['old_name']
        new_name = request.json['new_name']
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(old_name)
        new_blob = bucket.rename_blob(blob, new_name)
        return jsonify({"message": f"File renamed from {old_name} to {new_blob.name}."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_recommender():
    global recommender
    with recommender_lock:
        if recommender is None:
            if os.path.exists("recommender.pkl"):
                print("Loading saved recommender...")
                recommender = QuestionRecommender.load_recommender("recommender.pkl")
                print("Recommender loaded.")
            else:
                raise RuntimeError("Recommender file not found!")
    return recommender

class QuestionRecommender:
    def __init__(self, file_path="data.json"):
        self.df = self.load_and_preprocess_data(file_path)
        self.similarity_matrix = None
        self.topic_matrix = None
        self.potential_matrix = None
        self.mrf = None
        self.G = None

        # Pre-calculate matrices and graph once
        self.calculate_similarity_matrix()
        self.calculate_topic_matrix()
        self.calculate_potential_matrix()
        self.build_graph()

    # Load and preprocess DataFrame only once
    def load_and_preprocess_data(self, file_path):
        df = pd.read_json(file_path)
        df = self.preprocess_data(df)
        return df

    # Preprocess data (normalizing 'likability' and 'accuracy')
    def preprocess_data(self, df):
        scaler = MinMaxScaler()
        df[['likability', 'accuracy']] = scaler.fit_transform(df[['likability', 'accuracy']])
        return df

    # Function to calculate the similarity matrix using TF-IDF
    def calculate_similarity_matrix(self):
        question_vectors = TfidfVectorizer().fit_transform(self.df['question'])
        self.similarity_matrix = cosine_similarity(question_vectors)

    # Function to calculate the topic matrix (using custom topic model)
    def calculate_topic_matrix(self):
        self.topic_matrix = self.custom_topic_model(self.df['question'].tolist(), n_topics=3)

    # Function to calculate the joint probability of accuracy and difficulty (potential matrix)
    def calculate_potential_matrix(self):
        joint_prob = pd.crosstab(self.df['accuracy'], self.df['difficulty'], normalize='all')
        self.potential_matrix = np.zeros((2, 3))  # 2 values for accuracy (0, 1) and 3 values for difficulty (1, 2, 3)
        
        for acc in range(2):  # Accuracy can be 0 or 1
            for diff in range(1, 4):  # Difficulty can be 1, 2, or 3
                if diff in joint_prob.columns:
                    self.potential_matrix[acc, diff-1] = joint_prob.loc[acc, diff] if acc in joint_prob.index else 0

    # Markov Random Field (MRF) Implementation
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

    # Belief Propagation Implementation
    def belief_propagation(self, mrf, max_iter=10):
        messages = {}
        
        # Initialize messages to ones
        for (node1, node2) in mrf.edges:
            messages[(node1, node2)] = np.ones(2)  # Uniform initialization for binary values (0, 1)
        
        for _ in range(max_iter):
            for (node1, node2) in mrf.edges:
                incoming_messages = np.prod([messages[(nbr, node1)] for nbr in mrf.nodes[node1] if nbr != node2], axis=0)
                
                for val1 in range(2):  # For accuracy, which can take values 0 or 1
                    for val2 in range(3):  # For difficulty, which can take values 1, 2, or 3
                        messages[(node1, node2)] = mrf.compute_potential(node1, node2, val1, val2)
        
        return messages

    # Custom Topic Modeling (similar to LDA)
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

    # Calculate topic overlap between two documents
    def topic_overlap(self, doc1_topics, doc2_topics):
        return np.sum(np.minimum(doc1_topics, doc2_topics))

    # Build Graph with Adjusted Weights for Topic Overlap and Content Similarity
    def build_graph(self):
        self.G = nx.Graph()
        for idx, row in self.df.iterrows():
            self.G.add_node(row['titleSlug'], difficulty=row['difficulty'], likability=row['likability'], accuracy=row['accuracy'])
        
        for i in range(len(self.df)):
            for j in range(i + 1, len(self.df)):
                prob = np.random.random()  # Mock for Bayesian Probability
                content_similarity = self.similarity_matrix[i, j]
                topic_overlap_score = self.topic_overlap(self.topic_matrix[i], self.topic_matrix[j])
                
                combined_weight = (content_similarity + topic_overlap_score) / 2
                self.G.add_edge(self.df.loc[i, 'titleSlug'], self.df.loc[j, 'titleSlug'], weight=combined_weight)

    # Function to recommend questions based on solved questions
    def recommend_questions(self, solved_questions, top_n=3):
        recommendations = {}
        for solved in solved_questions:
            if solved not in self.G:
                continue
            neighbors = sorted(self.G[solved].items(), key=lambda x: x[1]['weight'], reverse=True)
            for neighbor, _ in neighbors:
                if neighbor not in solved_questions:
                    recommendations[neighbor] = self.G[solved][neighbor]['weight']

        return sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:top_n]

    def save_recommender(self, file_path="recommender.pkl"):
        with open(file_path, 'wb') as f:
            pickle.dump({
                'df': self.df,
                'similarity_matrix': self.similarity_matrix,
                'topic_matrix': self.topic_matrix,
                'potential_matrix': self.potential_matrix,
                'graph': self.G,
            }, f)

    @staticmethod
    def load_recommender(file_path="recommender.pkl"):
        with open(file_path, 'rb') as f:
            data = pickle.load(f)
            recommender = QuestionRecommender.__new__(QuestionRecommender)
            recommender.df = data['df']
            recommender.similarity_matrix = data['similarity_matrix']
            recommender.topic_matrix = data['topic_matrix']
            recommender.potential_matrix = data['potential_matrix']
            recommender.G = data['graph']
            return recommender


@app.route("/", methods=["GET"])
def home():
    return "API is Runnning on Google Cloud Webservice"

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        recommender = get_recommender()
        data = request.json
        count = data.get('count',10)
        solved_questions = data.get('solved_questions', ["two-sum"])

        if  not isinstance(solved_questions, list):
            return jsonify({"error": "Invalid input data. Provide 'solved_questions' list."}), 400

        recommendations = recommender.recommend_questions( solved_questions,count)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

# [END gae_flex_quickstart]