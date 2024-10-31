'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { python } from '@codemirror/lang-python';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

// Dynamically import CodeMirror to avoid server-side rendering issues
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

// Mock data for the problem, to later be replaced with dynamic JSON content
const problemData = {
  title: "Two Sum",
  difficulty: "Easy",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
    }
  ]
};

export default function CodePage() {
  const [code, setCode] = useState('# Write your Python code here');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([
    { input: "[2,7,11,15]", target: "9", output: "[0,1]", passed: true },
    { input: "[3,2,4]", target: "6", output: "[1,2]", passed: true },
    { input: "[3,3]", target: "6", output: "[0,1]", passed: false },
  ]);

  const runCode = async () => {
    try {
      setOutput('Execution successful!\nOutput:\n42'); 
    } catch (error) {
      setOutput('Error:\n' + error.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex py-4 px-10 bg-gray-900 text-white">
      {/* Left Column: Problem Description */}
      <div className="w-1/3 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg mr-4">
        <h2 className="text-2xl font-semibold mb-2">{problemData.title}</h2>
        
        {/* Difficulty Tag */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-2 py-1 ${problemData.difficulty === "Easy" ? "bg-green-600" : "bg-yellow-600"} text-xs font-semibold rounded`}>
            {problemData.difficulty}
          </span>
        </div>
        
        {/* Problem Description */}
        <p className="text-md text-gray-400 mb-4">{problemData.description}</p>
        
        {/* Example Section */}
        {problemData.examples.map((example, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold">Example {index + 1}:</h3>
            <div className="bg-gray-700 p-2 rounded text-gray-300 text-sm mt-1">
              <pre>Input: {example.input}</pre>
              <pre>Output: {example.output}</pre>
              {example.explanation && <pre>Explanation: {example.explanation}</pre>}
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Code Editor and Output */}
      <div className="w-2/3 flex flex-col space-y-4">
        {/* Code Editor */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Code</h3>
          <CodeMirror
            value={code}
            height="350px"
            theme={okaidia}
            extensions={[python()]}
            onChange={(value) => setCode(value)}
          />
        </div>

        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Testcase</h3>
            <button 
              onClick={runCode}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Run Code
            </button>
          </div>
          <div className="bg-gray-700 p-2 rounded text-gray-300 text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-2">Input</th>
                  <th className="py-2">Target</th>
                  <th className="py-2">Expected Output</th>
                  <th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((test, index) => (
                  <tr key={index} className="border-b border-gray-600">
                    <td className="py-2">{test.input}</td>
                    <td className="py-2">{test.target}</td>
                    <td className="py-2">{test.output}</td>
                    <td className={`py-2 ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {test.passed ? 'Passed' : 'Failed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
