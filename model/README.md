# **Problem Recommendation System**

**Leetcode Problem Recommendation System** offers an intelligent system to recommend Leetcode problems based on user preferences, leveraging data from the Leetcode API. The system incorporates content similarity, topic modeling, and user engagement metrics to deliver personalized recommendations.

---

## 🎯 **Features**

- 🔗 **API Integration**: Fetches real-time problem data from the Leetcode API.
- 🧹 **Data Preprocessing**: Cleans and organizes problem data for analysis.
- 🤖 **Machine Learning**: Implements similarity analysis using TF-IDF and cosine similarity.
- 📊 **Markov Random Field**: Models relationships between problems using a Markov Random Field (MRF).
- 🖇️ **Graph-Based Recommendations**: Utilizes a graph structure to recommend questions based on solved problems.
- 🔍 **Custom Topic Modeling**: Identifies latent topics in problem statements.

---

## ⚙️ **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/leetcode-recommendation-system.git
   cd leetcode-recommendation-system
   ```

2. **Install dependencies** :

```bash
   pip install -r requirements.txt
```

2. **Run the Leetcode API locally** :

* Clone the [Leetcode API repository](https://github.com/alfaarghya/alfa-leetcode-api).
* Remove rate limiter by editing `src/app.ts` in the API code.
* Start the API locally:
  ```bash
  npm install
  npm run dev
  ```

2. **Update the API Base URL** :
   Replace the `API_BASE_URL` in the script with:

```python
   API_BASE_URL = "http://localhost:3000/"
```

---

## 🛠️ **Usage**

### **1. Data Collection**

Run the script to fetch and process problem data:

```bash
python data_collection.py
```

### **2. Recommendation System**

Use the recommender system:

```python
recommender = QuestionRecommender()
solved_questions = ["two-sum", "add-two-numbers"]
top_n = 10
recommended = recommender.recommend_questions(solved_questions, top_n)
print("Recommendations:", recommended)
```

### **3. File Outputs**

* 📄 `data.json`: Raw problem data fetched from the API.
* 📄 `updated_data.json`: Preprocessed data ready for analysis.

---

## 🛡️ **Technologies Used**

* 🐍  **Python** : Core programming language.
* 📊  **Pandas & NumPy** : Data manipulation and numerical computations.
* ⚙️  **Scikit-learn** : Machine learning and vectorization.
* 🌐  **NetworkX** : Graph construction and analysis.
* 🔗  **Leetcode API** : Data source for problem sets.

---

## 🙌 **Credits**

* **Leetcode API** : [Alfa Leetcode API](https://github.com/alfaarghya/alfa-leetcode-api)

---

## 🔍 **How It Works**

### **1. Data Collection**

The system fetches problem data using the Leetcode API, including:

* Problem metadata (accuracy, difficulty, topics).
* Problem details (description, likes, dislikes).

### **2. Preprocessing**

* Normalizes `likability` and `accuracy` scores.
* Maps difficulty levels to numeric values.

### **3. Model Building**

* **TF-IDF Similarity** : Identifies content similarity between problems.
* **Custom Topic Modeling** : Clusters problems into latent topics.
* **Markov Random Field** : Builds relationships based on accuracy and difficulty.

### **4. Recommendations**

Recommends unsolved problems based on:

* Solved problem graph connections.
* Combined weights of content similarity and topic overlap.

---

## ✏️ **Customization**

### **Modify the Number of Topics**

Update the `n_topics` parameter in the `custom_topic_model` function.

### **Adjust Recommendation Criteria**

Change the weights for content similarity and topic overlap in the `build_graph` method.

---

## ⚠️ **Limitations**

* **Rate Limits** : The Leetcode API has rate limits; it’s recommended to run it locally.
* **Premium Problems** : Premium problems are excluded due to lack of data.
