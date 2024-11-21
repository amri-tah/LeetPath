# **LeetPath: A Graph-Based LeetCode Question Recommender 🧭🔍**

LeetPath is a personalized question recommendation system designed for LeetCode users. Using graph-based structures, topic modeling, and probabilistic reasoning (Markov Random Field), the system analyzes user interaction, question similarity, and topic relevance to suggest the most appropriate questions for continued skill improvement. 📈

## **Demo**

## **Features 🌟**

- 🔍 Personalized Recommendations: Suggests questions based on user activity and skills.
- 🧠 Topic Modeling: Groups questions by related topics for better understanding.
- 📊 Interactive Dashboard: Displays user stats and recommended questions.
- ⚡ Real-Time Performance: Fast and efficient recommendations using graph-based algorithms and belief propagation.

## **Tech Stack 🛠️**

![Tech Stack](https://skillicons.dev/icons?i=nextjs,tailwind,go,mongodb,flask,firebase,graphql,vercel,gcp,)

- **Frontend**: Next.js with Tailwind CSS for a responsive and interactive UI.
- **Backend**: **Flask** for API endpoints for the model and Go for fetching user data.
- **Database**: **MongoDB** for storing user data.
- **Authentication**: **Firebase** for secure user login and management.
- **GraphQL**: For efficient and flexible data querying.

## **Deployment and Hosting 💻**

- The recommendation engine is deployed on **Google Cloud Platform** using **App Engine**.
- The backend code is deployed on **OnRender**.
- The frontend is hosted on **Vercel**.

## **How It Works** 📊
- Question Similarity: Content-based filtering using TF-IDF and cosine similarity to recommend questions based on their content similarity.
- Topic Modeling: Grouping questions by latent topics using a custom topic modeling algorithm (similar to Latent Dirichlet Allocation).
- Markov Random Field (MRF): Models relationships between questions, accounting for user engagement, difficulty, and question similarities.
- Belief Propagation: Used to refine potential values in the MRF and improve recommendation accuracy.

## Screenshots
![landing](https://github.com/user-attachments/assets/4f15700a-7032-4ce2-bd59-c159005c5271)
![Screenshot 2024-11-21 215125](https://github.com/user-attachments/assets/e8f932e7-d618-4645-9a2a-834f0612d981)
![Screenshot 2024-11-21 215155](https://github.com/user-attachments/assets/a9fad515-edb5-47b9-aeb5-a361f3770853)
![recommender page 1](https://github.com/user-attachments/assets/efeb391e-04ab-475f-8262-c375c7d3939e)
![profile](https://github.com/user-attachments/assets/031eea4d-d9f9-4b46-887a-ab97dfa1a208)


### Contributors

<table style="width:100%; text-align:center;border: none;">
    <tr>
        <td style="width:33.33%;"><img src="https://github.com/VishalTheHuman.png/" style="width:100%; height:auto;"></td>
        <td style="width:33.33%;"><img src="https://github.com/amri-tah.png/" style="width:100%; height:auto;"></td>
        <td style="width:33.33%;"><img src="https://github.com/yeager209904.png/" style="width:120%; height:auto;"></td>
	<td style="width:33.33%;"><img src="https://github.com/GiriPrasath017.png/" style="width:120%; height:auto;"></td>
    </tr>
    <tr>
        <td><a href="https://github.com/VishalTheHuman" style="display:block; margin:auto;">@VishalTheHuman</a></td>
        <td><a href="https://github.com/amri-tah" style="display:block; margin:auto;">@amri-tah</a></td>
        <td><a href="https://github.com/yeager209904" style="display:block; margin:auto;">@yeager209904</a></td>
	<td><a href="https://github.com/GiriPrasath017" style="display:block; margin:auto;">@GiriPrasath017</a></td>
    </tr>
    <tr>
        <td><b style="display:block; margin:auto;">Vishal S</b></td>
        <td><b style="display:block; margin:auto;">Amritha Nandini</b></td>
        <td><b style="display:block; margin:auto;">Anerud Thiyagarajan</b></td>
	<td><b style="display:block; margin:auto;">Giri Prasath R</b></td>
    </tr>
</table>
