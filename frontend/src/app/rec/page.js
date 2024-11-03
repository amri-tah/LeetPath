'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [question, setQuestion] = useState(null);
  const [userSkill, setUserSkill] = useState(null);

  const getRecommendation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/recommend');
      setQuestion(response.data);
    } catch (error) {
      console.error('No more questions available');
    }
  };

  const submitAttempt = async (solved, timeTaken, liked) => {
    try {
      const response = await axios.post('http://localhost:5000/attempt', {
        question_id: question.question_id,
        solved,
        time_taken: timeTaken,
        liked,
      });
      setUserSkill(response.data.user_skill);
      await getRecommendation();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getRecommendation();
  }, []);

  return (
    <div>
      <h1>Question Recommendation System</h1>
      {question ? (
        <div>
          <h2>{question.title}</h2>
          <p>Difficulty: {question.difficulty}</p>
          <p>Topics: {question.topics.join(', ')}</p>
          <button onClick={() => submitAttempt(true, 30, true)}>Attempt Solved (Liked)</button>
          <button onClick={() => submitAttempt(false, 45, false)}>Attempt Failed</button>
        </div>
      ) : (
        <p>No question available</p>
      )}
      <p>User Skill: {userSkill}</p>
    </div>
  );
}
