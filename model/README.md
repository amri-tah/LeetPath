## **How It Works**
LeetPath's backend recommendation system uses a **graph-based model** to identify relationships between questions based on **content similarity**, **topic modeling**, and **user performance metrics**. Below is an outline of its functionality:

### 1. **Data Preprocessing**
- Loads question data from a JSON file and normalizes features like **likability** and **accuracy** using Min-Max Scaling.
- Transforms question content into numerical vectors using **TF-IDF Vectorization** for calculating similarity.

### 2. **Topic Modeling**
- Implements a custom probabilistic topic model inspired by **Latent Dirichlet Allocation (LDA)** to group questions into relevant topics.
- Generates a **topic matrix** that quantifies the distribution of topics across questions.

### 3. **Graph Construction**
- Constructs a graph using **NetworkX**, where:
  - Nodes represent individual questions.
  - Edges represent relationships weighted by **content similarity** and **topic overlap**.
- Dynamically adjusts weights based on factors like **Bayesian probabilities** and **question difficulty**.

### 4. **Recommendation Algorithm**
- For a given set of solved questions, the system:
  - Identifies neighboring questions in the graph.
  - Ranks neighbors based on edge weights, which incorporate similarity and topic relevance.
  - Returns the top N recommendations.
