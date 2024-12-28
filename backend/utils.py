import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

def preprocess_data(df):
    #preprocesses the data 
    scaler = StandardScaler()
    df['user_id_normalized'] = scaler.fit_transform(df['user_id'].values.reshape(-1, 1));
    df['item_id_normalized'] = scaler.fit_transform(df['item_id'].values.reshape(-1, 1)); 


    return df['user_id_normalized'], df['item_id_normalized'], df['rating']