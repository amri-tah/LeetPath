import re
from surprise import Reader,Dataset,SVD,accuracy
from surprise.model_selection import GridSearchCV
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score


import pandas as pd

def load_data(path_data):    #this one laods useritem interaction data from the file(json)
    try:
        return pd.read_csv(path_data)
    except FileNotFoundError:
        raise ValueError("Dta file not found at : " , path_data)
    
def surprise_data_prepare(df):   #this one creates data with the library surprise , takes df=pandas dataframe 
    reader=Reader(rating_scale=(0,1))   #0=not interact 1=interact
    return Dataset.load_from_df(df[["user_id","item_id","rating"]],reader)

def training_of_the_svd_model(data,parameter_grid=None):
    if parameter_grid:   #paramteregrid is hyperparamter
        algo = SVD()
        gscv = GridSearchCV(algo, parameter_grid, measures=['rmse', 'mae'], cv=5, verbose=True)
        gscv.fit(data)
        return gscv.best_estimator
    else:
        algo = SVD()
        algo.fit(data)
        return algo
    
def evaluate_model(model,data):   #gives the modl
    predictions = model.test(data.build_testset())
    rmse = accuracy.rmse(predictions)
    mae = accuracy.mae(predictions)

    true_labels = [int(pred.r_ui > 0) for pred in predictions]  #assume binary rating
    predicted_ratings = [pred.est for pred in predictions]
    predicted_labels = [1 if pred >= 0.5 else 0 for pred in predicted_ratings]  #i kept a range for the predition

    precision = precision_score(true_labels, predicted_labels)
    recall = recall_score(true_labels, predicted_labels)
    f1 = f1_score(true_labels, predicted_labels)

    return {'rmse': rmse, 'mae': mae, 'precision': precision, 'recall': recall, 'f1': f1}  #rootmeansquare meanabs error

def getting_top_n_recommendations(df,user_id,model,n=10):
    known_items=set(df[df["user_id"]==user_id]["item_id"]) #only user interacted items
    all_items = set(df['item_id']) #to get al items
    not_known_items=list(all_items-known_items)
    
    predictions=[model.predict(user_id,iid ) for iid in not_known_items]
    predictions.sort(key=lambda x: x.est,reverse=True)  #sorting 
    
    return [prediction.iid for prediction in predictions[:n] ] #get top n recommended items by slicing


cf_data = {
    # SAMPLE IDSSSSSS
    'user_id': [1, 2, 3, 4, 1, 2, 3],
    'item_id': [101, 102, 103, 104, 105, 106, 107],
    'rating': [5, 4, 3, 5, 2, 1, 3]
}

cf_df = pd.DataFrame(cf_data)
cf_df.to_csv('data/cf_data.csv', index=False)

if __name__=="__main__":
    path_data='data.json'
    df=load_data(path_data)
    surprise_data=surprise_data_prepare(df)
    
    param_grid={"n_factors":[10,20,30],"lr_all":[0.005,0.01,0.05]}
    model=training_of_the_svd_model(surprise_data,param_grid)
    
    user_id=999
    recommendations=getting_top_n_recommendations(model,user_id)
    
    print("Top", len(recommendations), "recommendations for user", user_id, ":", recommendations)
