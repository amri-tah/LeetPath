'use client';
import React, { useState, useEffect } from 'react';
import data from './data.json';
import { FaArrowRight } from 'react-icons/fa';

const Rec = () => {
  const [topProblems, setTopProblems] = useState([]);

  useEffect(() => {
    const problems = Object.values(data)
      .slice(0, 10)
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
    <div className="bg-gray-900 py-8 px-4 sm:px-6 md:px-10 text-white w-full flex items-center justify-center">
      <div className="mx-auto w-full text-black p-5 rounded-xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center justify-center space-x-2">
            <span>🚀</span>
            <span>Leetcode Question Recommender</span>
            <span>🧠</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
            Your personalized guide to mastering coding problems! 💻✨
          </p>
          <div className="mt-5 bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-5 rounded-lg shadow-lg">
            <p className="text-sm sm:text-base font-semibold">
              📝 <strong>Note:</strong> This is just a sample UI. Please visit our{' '}
              <a
                target="_blank"
                href="https://github.com/amri-tah/LeetPath/tree/main"
                className="underline"
              >
                Github Repository
              </a>{' '}
              to deploy the model by yourself. Cloud Services cost a lot man!!! 😭
            </p>
          </div>
        </div>
        <ul className="space-y-3 sm:space-y-4">
          {topProblems.map((problem, index) => (
            <li
              key={problem.questionId}
              className="p-4 sm:p-5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-1">
                <div>
                  <h2
                    className="text-sm sm:text-base lg:text-lg font-semibold cursor-pointer"
                    onClick={() => toggleExpanded(index)}
                  >
                    {index + 1}. {problem.title}
                  </h2>
                  <div className="flex flex-wrap gap-1 items-center mt-2">
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded text-white ${
                        problem.difficulty === 'easy'
                          ? 'bg-green-500'
                          : problem.difficulty === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    {problem.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm border-black bg-white text-black"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 mt-3 sm:mt-0">
                  <button
                    onClick={() => toggleSolved(index)}
                    className={`py-1 px-3 rounded-lg text-xs sm:text-sm text-white ${
                      problem.solved ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {problem.solved ? 'Mark Unsolved' : 'Mark Solved'}
                  </button>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${problem.link}`}
                    className="flex items-center"
                  >
                    <FaArrowRight className="text-blue-500 transform -rotate-45 w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </div>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  problem.expanded ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="mt-3">
                  <p
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
