'use client';
import React, { useState, useEffect } from 'react';
import data from './data.json';
import { FaArrowRight } from 'react-icons/fa';

const Rec = () => {
  const [topProblems, setTopProblems] = useState([]);

  useEffect(() => {
    // Extract the top 10 problems from the JSON data
    const problems = Object.values(data) // Assuming `data` is an object
      .slice(0, 10) // Get the first 10 elements
      .map((problem) => ({
        ...problem,
        solved: false,
        expanded: false,
      }));
    setTopProblems(problems);
  }, []);

  const toggleSolved = (index) => {
    setTopProblems((prevProblems) =>
      prevProblems.map((problem, i) =>
        i === index ? { ...problem, solved: !problem.solved } : problem
      )
    );
  };

  const toggleExpanded = (index) => {
    setTopProblems((prevProblems) =>
      prevProblems.map((problem, i) =>
        i === index ? { ...problem, expanded: !problem.expanded } : problem
      )
    );
  };

  return (
    <div className="bg-gray-900 py-10 px-[10%] text-white w-full flex items-center justify-center">
      <div className="mx-auto w-full text-black p-5 rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center space-x-2">
            <span>🚀</span>
            <span>Leetcode Question Recommender</span>
            <span>🧠</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Your personalized guide to mastering coding problems! 💻✨
          </p>
          <div className="mt-5 bg-blue-600 text-white py-3 px-5 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">
            📝 <strong>Note:</strong> This is just a sample UI. Please go to our <a target="_blank" href="https://github.com/amri-tah/LeetPath/tree/main"><u>Github Repository</u></a> to deploy the model by yourself. Cloud Services cost a lot man!!! 😭
              </p>
          </div>
        </div>
        <ul className="space-y-4">
          {topProblems.map((problem, index) => (
            <li
              key={problem.questionId}
              className="p-5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mt-1">
                <div>
                  <h2
                    className="text-lg font-semibold cursor-pointer"
                    onClick={() => toggleExpanded(index)}
                  >
                    {index + 1}. {problem.title}
                  </h2>
                  <div className="flex gap-1 items-center">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded text-white 
                        ${
                          problem.difficulty === 'easy'
                            ? 'bg-green-500'
                            : problem.difficulty === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                    >
                      {problem.difficulty === 'easy'
                        ? 'Easy'
                        : problem.difficulty === 'medium'
                        ? 'Medium'
                        : 'Hard'}
                    </span>
                    {problem.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded border text-sm border-black bg-white text-black"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleSolved(index)}
                    className={`py-1 px-3 rounded-lg text-white ${
                      problem.solved ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {problem.solved ? 'Mark Unsolved' : 'Mark Solved'}
                  </button>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${problem.link}`}
                    className="flex items-center ml-auto"
                  >
                    <FaArrowRight className="text-blue-500 transform -rotate-45 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                  </a>
                </div>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  problem.expanded ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="mt-4">
                  <p
                    className=""
                    dangerouslySetInnerHTML={{ __html: problem.question }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Rec;
