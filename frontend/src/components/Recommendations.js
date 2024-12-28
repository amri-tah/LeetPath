"use client"
import React, { useState } from "react";
import getRecommendations from "@/app/fetch/RecommendationService";

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedModel, setSelectedModel] = useState("collaborative");

  const handleGetRecommendations = async () => {
    try {
      const userId = 999;
      const numRecommendations = 10;
      const recommendations = await getRecommendations(
        userId,
        numRecommendations,
        selectedModel
      );
      setRecommendations(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    }
  };

  return (
    <div>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="collaborative">Collaborative Filtering</option>
        <option value="content_based">Content-Based Filtering</option>
        <option value="deep_learning">Deep Learning</option>
      </select>
      <button onClick={handleGetRecommendations}>Get Recommendations</button>
      <ul>
        {recommendations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Recommendations;
