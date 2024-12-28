import re
from numpy import vectorize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd


def data_load(path_data):
    return pd.read_csv(path_data)

def get_item_description(df):   #this takes the ques descriotion and return the list of ques
    return df["item-description"].tolist()

def create_tfidf_matrix(descriptions):  #this checks how a word is relevnt desctiotions include the questions of leetcode  and will giv the sparse mtix
    vectorizer=TfidfVectorizer(stop_words="english")
    tfidf_matrix=vectorizer.fit_transform(descriptions)
    return tfidf_matrix

def similar_item_getting(tfidf_matrix, item_index, neighbors=10):
    similartes=cosine_similarity(tfidf_matrix[item_index],tfidf_matrix).flatten()  #flattern convert into single structure
    similar_item_indexes=similartes.argsort()[::-1][1:neighbors+1]  #revers the arr and exlude the first elemt in neigbour
    return similar_item_indexes


# SAMPLE DATA
cb_data = {
    'problem_id': [1, 2, 3, 4, 5, 6, 7],
    'title': [
        "Two Sum",
        "Add Two Numbers",
        "Longest Substring Without Repeats",
        "Median of Two Sorted Arrays",
        "Reverse a Linked List",
        "Binary Tree Inorder Traversal",
        "LRU Cache"
    ],
    'description': [
        "Find two numbers that add up to a target.",
        "Add two numbers represented as linked lists.",
        "Find the length of the longest substring without repeats.",
        "Find the median of two sorted arrays.",
        "Reverse a linked list iteratively and recursively.",
        "Perform inorder traversal of a binary tree.",
        "Implement an LRU Cache using a data structure."
    ],
    'tags': [
        "arrays, hash-table",
        "linked-list, math",
        "string, sliding-window",
        "array, divide-and-conquer",
        "linked-list",
        "tree, recursion, stack",
        "design, hash-table, linked"
    ],
    'difficulty': ["easy", "medium", "medium", "hard", "easy", "easy", "hard"],
    'popularity': ["high", "high", "high", "medium", "high", "medium", "high"]
}

cb_df = pd.DataFrame(cb_data)
cb_df.to_csv('data/cb_data.csv', index=False)


    

