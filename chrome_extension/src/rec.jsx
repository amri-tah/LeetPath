"use client";
import React, { useState, useEffect } from "react";
import data from "./data.json";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJ_DOMAIN,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const Rec = () => {
  const navigate = useNavigate();
  const [topProblems, setTopProblems] = useState([]);
  const [userData, setUserData] = useState(null);
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser(user);
          try {
            const response = await fetch(
              "http://127.0.0.1:8080/getSolvedQuestions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: user.email }),
              }
            );
            const userResponseData = await response.json();

            if (userResponseData.status) {
              setUserData(userResponseData);
            } else {
              console.error("Failed to fetch user data");
            }
            console.log(userResponseData);
            // Get solved questions from user data or default to a sample list
            const solvedQuestions = userResponseData.solved_questions || [
              "two-sum",
              "add-two-integers",
            ];
            console.log(solvedQuestions);

            const recResponse = await axios.post(
              "http://127.0.0.1:5000/recommend",
              {
                solved_questions: solvedQuestions,
                count: 10,
              }
            );

            // Extract slugs from the recommendations
            const recommendedSlugs = recResponse.data.recommendations
              .map(([slug]) => slug)
              .slice(0, 10);

            console.log(recommendedSlugs);
            // Filter the problems from `data.json` based on the slugs
            const recommendedProblems = Object.values(data) // Assuming data is an object
              .filter((problem) => recommendedSlugs.includes(problem.titleSlug))
              .map((problem) => ({
                ...problem,
                solved: false,
                expanded: false,
              }));

            // Set the recommended problems to the state
            setTopProblems(recommendedProblems);
          } catch (error) {
            console.error("Error fetching user or recommendations:", error);
          }
        } else {
          navigate("/register");
        }
      });

      return () => unsubscribe();
    };

    fetchUserData();
  }, [auth, navigate]);

  const toggleSolved = async (index) => {
    const problem = topProblems[index];
    const email = user.email;
    console.log(email);
    console.log(problem);
    if (!email) return;

    try {
      let response;

      // If the question is solved, remove it
      if (problem.solved) {
        response = await axios.post(
          "http://127.0.0.1:8080/removeSolvedQuestion",
          {
            email: email,
            question_slug: problem.titleSlug,
          }
        );
      } else {
        // Otherwise, add it
        response = await axios.post("http://127.0.0.1:8080/addSolvedQuestion", {
          email: email,
          question_slug: problem.titleSlug,
        });
      }

      // Check if the operation was successful
      if (response.data.status) {
        // Update the local state after API success
        setTopProblems((prevProblems) =>
          prevProblems.map((p, i) =>
            i === index ? { ...p, solved: !p.solved } : p
          )
        );
      } else {
        console.error("Failed to update solved status");
      }
    } catch (error) {
      console.error("Error toggling solved status:", error);
    }
  };

  const toggleExpanded = (index) => {
    setTopProblems((prevProblems) =>
      prevProblems.map((problem, i) =>
        i === index ? { ...problem, expanded: !problem.expanded } : problem
      )
    );
  };

  return (
    <div className="bg-gray-900 text-white w-96 h-[500px] flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
      <div className="mx-auto w-96 text-black p-5 rounded-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-6 mt-4">
            <span>Your Personalized Top 10 Recommendations 🧠</span>
          </h1>
        </div>
        <ul className="space-y-4">
          {topProblems.map((problem, index) => (
            <li
              key={problem.questionId}
              className="p-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm"
            >
              <div className="flex items-start flex-col justify-between mt-1">
                <div>
                  <h2
                    className="text-base font-semibold cursor-pointer"
                    onClick={() => toggleExpanded(index)}
                  >
                    {index + 1}. {problem.title}
                  </h2>
                  <div className="flex gap-2 items-center mt-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs rounded text-white font-semibold
                        ${
                          problem.difficulty === "easy"
                            ? "bg-green-500"
                            : problem.difficulty === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                    >
                      {problem.difficulty === "easy"
                        ? "Easy"
                        : problem.difficulty === "medium"
                        ? "Medium"
                        : "Hard"}
                    </span>
                    {problem.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded border border-black bg-white text-black"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() => toggleSolved(index)}
                    className={`py-1 px-2 rounded-lg text-white ${
                      problem.solved ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {problem.solved ? "Mark Unsolved" : "Mark Solved"}
                  </button>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${problem.link}`}
                    className="flex items-center justify-center px-2 py-1 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-6=700"
                  >
                    <span>Solve</span>
                    <FaArrowRight className="w-3 h-3 -rotate-45 ml-2" />
                  </a>
                </div>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  problem.expanded ? "max-h-screen" : "max-h-0"
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