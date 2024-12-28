from flask import Flask, request, jsonify
import numpy as np
from backend.model.deep_learning import QuestionRecommendationModel
from backend.models.collaborative_filtering import load_data as load_cf_data, surprise_data_prepare, training_of_svd_model, evaluate_model, getting_top_n_recommendations
from backend.models.content_based_filtering import data_load as load_cb_data, get_item_description, create_tfidf_matrix, similar_item_getting
from backend.utils import preprocess_data

app = Flask(__name__)

cf_data_path = 'data/cf_data.csv'  
cb_data_path = 'data/cb_data.csv'  

cf_df = load_cf_data(cf_data_path)
cf_surprise_data = surprise_data_prepare(cf_df)

cb_df = load_cb_data(cb_data_path)
cb_descriptions = get_item_description(cb_df)
cb_tfidf_matrix = create_tfidf_matrix(cb_descriptions)

cf_model = training_of_svd_model(cf_surprise_data)  

#used for preprocssing data
dl_df = load_cf_data(cf_data_path) 
user_ids, item_ids, ratings = preprocess_data(dl_df) 
num_users = len(user_ids.unique())
num_items = len(item_ids.unique())
dl_model = QuestionRecommendationModel(num_users, num_items)
dl_model.compile(optimizer='adam', loss='binary_crossentropy')
dl_model.fit([user_ids, item_ids], ratings, epochs=10) 

def compare_model_performance():
        metrics = {
            'collaborative': {'accuracy': 0, 'response_time': 0},
            'content_based': {'accuracy': 0, 'response_time': 0}, 
            'deep_learning': {'accuracy': 0, 'response_time': 0}
        }
        
        test_users = cf_df['user_id'].unique()[:100]
        
        for model in metrics.keys():
            start_time = time.time()
            correct_predictions = 0
            total_predictions = 0
            
            for user in test_users:
                try:
                    actual_items = set(cf_df[cf_df['user_id'] == user]['item_id'].values)
                    response = recommend(str(user), model_name=model)
                    recommended_items = set(response.get_json()['recommendations'])
                    
                    if len(actual_items) > 0:
                        correct_predictions += len(actual_items.intersection(recommended_items))
                        total_predictions += len(recommended_items)
                        
                except Exception as e:
                    print(f"Error evaluating {model} for user {user}: {str(e)}")
                    continue
            
            end_time = time.time()

@app.route('/recommend/<user_id>', methods=['GET'])
def recommend(user_id):
    try:
        model_name = request.args.get('model', 'collaborative')#u will get the model nam
        n = int(request.args.get('n', 10))

        if model_name == 'collaborative':
            recommendations = getting_top_n_recommendations(cf_model, user_id, n)
        elif model_name == 'content_based':
            user_items = ...  
            recommendations = [similar_item_getting(cb_tfidf_matrix, item_index, n) for item_index in user_items]
        elif model_name == 'deep_learning':
             
            user_id_encoded = ...  
            predictions = dl_model.predict([user_id_encoded, np.arange(num_items)])
            top_indices = np.argsort(predictions)[::-1][:n]
            recommendations = [item_id for item_id in top_indices] 

        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
    
    