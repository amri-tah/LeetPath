'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

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
    if (!question) return; // Early return if `question` is null
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
  <div className='bg-gray-900 py-10 px-[10%] text-white w-full h-[85vh] flex items-center justify-center'>
    <div className='mx-auto w-fit h-max-[900px] max-w-4xl bg-white text-black p-10 rounded-xl'>
      
        {question ? (
          <div>
            <h2 className='text-3xl font-bold'>{question.title}</h2>
            <div className='my-2 flex flex-wrap gap-2'>
              <span 
                className={`px-3 py-1 rounded text-white 
                  ${question.difficulty === 1 ? 'bg-green-500' : 
                  question.difficulty === 2 ? 'bg-yellow-500' : 
                  'bg-red-500'}`}>
                {question.difficulty === 1 ? 'Easy' : 
                  question.difficulty === 2 ? 'Medium' : 
                  'Hard'}
              </span>
              
              {question.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded border border-black bg-white text-black"
                >
                  {topic}
                </span>
              ))}
            </div>

            <p 
              className='max-h-80 overflow-auto whitespace-normal' 
              dangerouslySetInnerHTML={{ __html: question.description }} 
            />
          </div>
        ) : (
          <p>No question available</p>
        )}
        
        {/* Buttons and link with the rotated arrow */}
        <div className='flex items-center mt-4'>
          <button onClick={() => submitAttempt(true, 30, true)} className='mr-4'>
            <FaCheckCircle className="w-10 h-10 mt-3 text-green-500" />
          </button>
          <button onClick={() => submitAttempt(false, 45, false)} className='mr-4'>
            <FaTimesCircle className="w-10 h-10 mt-3 text-red-500"/>
          </button>
          
          {/* Link to the problem (conditionally rendered) */}
          {question && (
            <a target="_blank" href={`${question.link}`} className='flex items-center ml-auto'>
              <span className='text-blue-500 mr-2 text-md'>View Problem</span>
              <FaArrowRight className="w-10 h-10 text-blue-500 -rotate-45" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
