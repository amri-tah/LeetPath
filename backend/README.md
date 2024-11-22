# **Backend Deployment Guide ⚙️**

This project includes two separate backend services: one implemented in **Go (Gin)** and the other in **Python (Flask)**.

### **MongoDB Setup**
Create a MongoDB Atlas Cluster and configure the connection URI in the `backend/go/.env` file.

### **Frontend Backend Mapping**
- **Go (Gin)**: Corresponds to `https://127.0.0.0:8080/` in the frontend code.
- **Python (Flask)**: Corresponds to `https://127.0.0.0:5000/` in the frontend code.

---

## **Go (Gin) Backend**

### **Online Deployment**
You can deploy the Go Gin app on platforms like Render, Vercel, or Heroku (free versions). Follow the documentation provided by your chosen service to set up the root directory and deploy the application.

### **Local Deployment**
Run the following command in the project directory:

```bash
go run main.go
```

---

## **Python (Flask) Backend**

### **Online Deployment**
Due to higher memory requirements, the Flask app cannot be deployed on free-tier services. The current setup supports deployment on **Google Cloud App Engine**.

#### **Steps for Deployment:**
1. Clone the repository:
    ```bash
    git clone https://github.com/amri-tah/LeetPath.git
    cd LeetPath/backend/model
    ```

2. Prepare the model:
   - Either upload the `recommender.pkl` file to `LeetPath/backend/model`.
   - Or generate the model by running:
     ```bash
     python create.py
     ```

3. Deploy to Google Cloud App Engine:
    ```bash
    gcloud app deploy
    ```

### **Local Deployment**
Run the following commands to set up and run the Flask backend locally:

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2. Prepare the model:
    ```bash
    python create.py
    ```

3. Run the Flask app:
    ```bash
    python main.py
    ```
