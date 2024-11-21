import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import networkx as nx
from threading import Lock
import pickle

class QuestionRecommender:
    """
    A system for recommending questions based on their content similarity, topic modeling, and 
    user engagement metrics (likability and accuracy). It uses a Markov Random Field (MRF) to 
    model relationships between questions and employs belief propagation for inference.
    """
    def __init__(self, file_path="updated_data.json"):
        """
        Initialize the recommender system by loading data, preprocessing it, and
        calculating matrices for similarity, topic modeling, and potentials. 
        Also constructs a Markov Random Field and a recommendation graph.
        
        Args:
            file_path (str): Path to the JSON file containing question data.
        """
        self.df = self.load_and_preprocess_data(file_path)
        self.similarity_matrix = None
        self.topic_matrix = None
        self.potential_matrix = None
        self.mrf = None
        self.G = None

        self.calculate_similarity_matrix()
        self.calculate_topic_matrix()
        self.calculate_potential_matrix()
        self.build_mrf()
        self.build_graph()

    def load_and_preprocess_data(self, file_path):
        """
        Load the dataset from a JSON file and preprocess it for further analysis.

        Args:
            file_path (str): Path to the dataset file.

        Returns:
            pd.DataFrame: Preprocessed DataFrame containing question data.
        """
        df = pd.read_json(file_path)
        df = self.preprocess_data(df)
        return df

    def preprocess_data(self, df):
        """
        Normalize the 'likability' and 'accuracy' columns using Min-Max Scaling.

        Args:
            df (pd.DataFrame): The input DataFrame.

        Returns:
            pd.DataFrame: The DataFrame with normalized 'likability' and 'accuracy'.
        """
        scaler = MinMaxScaler()
        df[['likability', 'accuracy']] = scaler.fit_transform(df[['likability', 'accuracy']])
        return df

    def calculate_similarity_matrix(self):
        """
        Calculate the pairwise similarity between questions using TF-IDF vectorization
        and cosine similarity. Results are stored in `self.similarity_matrix`.
        """
        question_vectors = TfidfVectorizer().fit_transform(self.df['question'])
        self.similarity_matrix = cosine_similarity(question_vectors)

    def calculate_topic_matrix(self):
        """
        Perform custom topic modeling on the questions to identify latent topics.
        Results are stored in `self.topic_matrix`.
        """
        self.topic_matrix = self.custom_topic_model(self.df['question'].tolist(), n_topics=3)

    def calculate_potential_matrix(self):
        """
        Compute the potential matrix for the Markov Random Field based on joint probabilities 
        of accuracy bins and difficulty levels. Uses binning to discretize accuracy.
        """
        bins = np.linspace(0, 1, 5)  # Divide accuracy into 4 bins
        self.df['accuracy_bin'] = np.digitize(self.df['accuracy'], bins) - 1
        joint_prob = pd.crosstab(self.df['accuracy_bin'], self.df['difficulty'], normalize='all')
        self.potential_matrix = np.zeros((4, 3))  # 4 bins for accuracy, 3 difficulty levels

        for acc_bin in range(4):  # Accuracy bins
            for diff in range(1, 4):  # Difficulty levels
                if diff in joint_prob.columns and acc_bin in joint_prob.index:
                    self.potential_matrix[acc_bin, diff - 1] = joint_prob.loc[acc_bin, diff]

    class MarkovRandomField:
        """
        A class representing a Markov Random Field (MRF), which consists of nodes (questions) 
        and edges (relationships between questions) with associated potentials.
        """
        def __init__(self):
            """
            Initialize the MRF with empty node and edge dictionaries and a dictionary
            for edge potentials.
            """
            self.edges = {}
            self.nodes = {}
            self.edge_potentials = {}

        def add_edge(self, node1, node2, potential):
            """
            Add an edge between two nodes with a specified potential matrix.

            Args:
                node1 (str): The first node.
                node2 (str): The second node.
                potential (np.ndarray): The edge potential matrix.
            """
            if node1 not in self.nodes:
                self.nodes[node1] = {}
            if node2 not in self.nodes:
                self.nodes[node2] = {}
            self.edges[(node1, node2)] = True
            self.edge_potentials[(node1, node2)] = potential

        def compute_potential(self, node1, node2, acc_bin, diff):
            """
            Compute the potential for a given pair of nodes based on accuracy bin 
            and difficulty level.

            Args:
                node1 (str): The first node.
                node2 (str): The second node.
                acc_bin (int): The accuracy bin index.
                diff (int): The difficulty index.

            Returns:
                float: The potential value for the specified parameters.
            """
            if (node1, node2) in self.edge_potentials:
                return self.edge_potentials[(node1, node2)][acc_bin, diff]
            return 1.0

    def belief_propagation(self, max_iter=10):
        """
        Run belief propagation on the MRF to compute refined potentials.

        Args:
            max_iter (int): Maximum number of iterations for belief propagation.

        Returns:
            dict: A dictionary containing messages for each edge in the MRF.
        """
        messages = {}
        for (node1, node2) in self.mrf.edges:
            messages[(node1, node2)] = np.ones((4, 3))  # 4 bins, 3 difficulty levels

        for _ in range(max_iter):
            for (node1, node2) in self.mrf.edges:
                incoming_messages = np.ones((4, 3))
                for nbr in self.mrf.nodes[node1]:
                    if nbr != node2:
                        incoming_messages *= messages[(nbr, node1)]
                
                new_message = np.zeros((4, 3))
                for acc_bin in range(4):
                    for diff in range(3):
                        new_message[acc_bin, diff] = (
                            self.mrf.compute_potential(node1, node2, acc_bin, diff)
                            * incoming_messages[acc_bin, diff]
                        )
                messages[(node1, node2)] = new_message / new_message.sum()

        return messages

    def build_mrf(self):
        """
        Build the Markov Random Field by adding nodes (questions) and edges with
        potentials based on the accuracy bins and difficulty levels.
        """
        self.mrf = self.MarkovRandomField()
        
        for idx, row in self.df.iterrows():
            self.mrf.nodes[row['titleSlug']] = {
                'accuracy_bin': row['accuracy_bin'],
                'difficulty': row['difficulty']
            }

        for i in range(len(self.df)):
            for j in range(i + 1, len(self.df)):
                acc_bin_i = self.df.loc[i, 'accuracy_bin']
                diff_i = self.df.loc[i, 'difficulty']
                acc_bin_j = self.df.loc[j, 'accuracy_bin']
                diff_j = self.df.loc[j, 'difficulty']
                
                edge_potential = np.zeros((4, 3))
                for acc_bin in range(4):
                    for diff in range(3):
                        if acc_bin == acc_bin_i or acc_bin == acc_bin_j:
                            edge_potential[acc_bin, diff] += 0.5
                        if diff == diff_i or diff == diff_j:
                            edge_potential[acc_bin, diff] += 0.5
                
                edge_potential /= edge_potential.sum()
                self.mrf.add_edge(self.df.loc[i, 'titleSlug'], self.df.loc[j, 'titleSlug'], edge_potential)

    def custom_topic_model(self, corpus, n_topics=2, alpha=0.1, beta=0.01):
        """
        Perform a simple topic modeling process using Gibbs sampling.

        Args:
            corpus (list of str): List of documents (questions).
            n_topics (int): Number of latent topics.
            alpha (float): Dirichlet prior for topics.
            beta (float): Dirichlet prior for words.

        Returns:
            np.ndarray: Document-topic matrix.
        """
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
        """
        Calculate the topic overlap score between two documents.

        Args:
            doc1_topics (np.ndarray): Topic distribution for the first document.
            doc2_topics (np.ndarray): Topic distribution for the second document.

        Returns:
            float: Sum of the minimum topic probabilities for all topics.
        """
        return np.sum(np.minimum(doc1_topics, doc2_topics))

    def build_graph(self):
        """
        Construct a graph where nodes represent questions, and edges are weighted by
        a combination of content similarity and topic overlap scores.
        """
        self.G = nx.Graph()
        for idx, row in self.df.iterrows():
            self.G.add_node(row['titleSlug'], difficulty=row['difficulty'], likability=row['likability'], accuracy=row['accuracy'])

        for i in range(len(self.df)):
            for j in range(i + 1, len(self.df)):
                content_similarity = self.similarity_matrix[i, j]
                topic_overlap_score = self.topic_overlap(self.topic_matrix[i], self.topic_matrix[j])
                combined_weight = (content_similarity + topic_overlap_score) / 2
                self.G.add_edge(self.df.loc[i, 'titleSlug'], self.df.loc[j, 'titleSlug'], weight=combined_weight)

    def recommend_questions(self, solved_questions, top_n=3):
        """
        Recommend questions based on solved questions using the constructed graph.

        Args:
            solved_questions (list of str): List of solved question IDs.
            top_n (int): Number of recommendations to return.

        Returns:
            list of tuple: Recommended questions with their weights, sorted in descending order.
        """
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


recommender = QuestionRecommender(file_path="data.json")
recommender.save_recommender("recommender.pkl")
print("Recommender created and saved.")