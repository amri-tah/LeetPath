from flask import Flask, request, jsonify
import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import networkx as nx
import requests
from threading import Lock

app = Flask(__name__)

recommender_lock = Lock()
recommender = None

def get_recommender():
    global recommender
    with recommender_lock:
        if recommender is None:
            print("Loading Model....")
            recommender = QuestionRecommender(file_path="updated_data.json")
            print("Model Loaded....")
    return recommender

class QuestionRecommender:
    def __init__(self, file_path="updated_data.json"):
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

@app.route("/", methods=["GET"])
def home():
    return "API is Runnning "

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