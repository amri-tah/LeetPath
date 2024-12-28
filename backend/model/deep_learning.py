from sklearn.metrics import f1_score, precision_score, recall_score
import tensorflow as tf
from tensorflow.keras.layers import Embedding, Input, Concatenate, Dense
from tensorflow.keras.models import Model

from backend.model.collaborative_filtering import evaluate_model

class QuestionRecommendationModel(tf.keras.Model):
    def __init__(self, num_users, num_questions, embedding_dim=64, hidden_units=64):
        super(QuestionRecommendationModel, self).__init__()
        self.user_embeddings = Embedding(num_users, embedding_dim)
        self.question_embeddings = Embedding(num_questions, embedding_dim)
        self.dense1 = Dense(hidden_units, activation='relu')
        self.dense2 = Dense(1, activation='sigmoid')  

    def call(self, inputs):
        user_id, question_id = inputs
        user_embedding = self.user_embeddings(user_id)
        question_embedding = self.question_embeddings(question_id)
        concatenated = Concatenate()([user_embedding, question_embedding])
        hidden = self.dense1(concatenated)
        output = self.dense2(hidden)
        return output

    def evaluate_dl_model(model, user_ids_test, item_ids_test, ratings_test):
        predictions = model.predict([user_ids_test, item_ids_test])
        predicted_labels = (predictions > 0.5).astype(int)  # Threshold for binary classification
        precision = precision_score(ratings_test, predicted_labels)
        recall = recall_score(ratings_test, predicted_labels)
        f1 = f1_score(ratings_test, predicted_labels)
        return {'precision': precision, 'recall': recall, 'f1': f1}

# Example 
# dl_results = evaluate_model(dl_model, dl_user_ids_val, dl_item_ids_val, dl_ratings_val)
# print(f"Deep Learning Model Precision: {dl_results['precision']}, Recall: {dl_results['recall']}, F1: {dl_results['f1']}")
