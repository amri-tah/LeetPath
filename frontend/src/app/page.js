'use client';
import { FaChartLine, FaBrain, FaNetworkWired, FaCogs } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-gray-900 text-white px-[5%] md:px-[10%]">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center sm:mb-10">
        <motion.div 
          className="w-full lg:w-[50%]"
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1 }}
        >
          <h1 className="text-[3rem] sm:text-[4rem] font-semibold leading-tight pt-4">
            Master LeetCode Problems, Your Way 🚀
          </h1>
          <h2 className="text-lg sm:text-xl mt-2">
            LeetPath is a personalized recommendation system for LeetCode users that analyzes user interactions, question similarity, and topic relevance to suggest the best questions for skill improvement. 📈
          </h2>
          <div className="flex gap-3 mt-5">
            <a href="#learnmore">
              <div className="px-5 py-3 rounded-lg text-xl bg-white text-black hover:bg-gray-300 transition">
                Learn More
              </div>
            </a>
            <a href="/register">
              <div className="px-5 py-3 rounded-lg text-xl bg-orange-500 text-white hover:bg-orange-400 transition">
                Get Started
              </div>
            </a>
          </div>
        </motion.div>
        <motion.div 
          className="w-full lg:w-[50%]" 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1 }}
        >
          <Image
            src="/landing.png"
            alt="Landing Image"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      {/* Video Section */}
      <section
        className="rounded-xl sm:mb-10"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          margin: '5% 0%',
          overflow: 'hidden',
        }}
      >
        <video
          src="/leetpathdemo.mp4"
          autoPlay
          loop
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </section>

      {/* Features Section */}
      <motion.div 
        className="bg-gray-900 text-white px-[5%] py-28 sm:mb-10"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
      >
        <h1 id="learnmore" className="text-[2.5rem] sm:text-[3.5rem] font-semibold text-center mb-6">
          Features
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-12">
          {['Personalized Recommendations', 'Skill and Difficulty Matching', 'Continuous Learning', 'Graph-Based Approach'].map((title, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 p-16 rounded-3xl shadow-xl transform hover:scale-105 transition duration-500 ease-in-out w-full"
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="bg-orange-500 px-8 py-4 rounded-full mb-6">
                {index === 0 && <FaChartLine className="text-white text-4xl" />}
                {index === 1 && <FaBrain className="text-white text-4xl" />}
                {index === 2 && <FaNetworkWired className="text-white text-4xl" />}
                {index === 3 && <FaCogs className="text-white text-4xl" />}
              </div>
              <h2 className="text-3xl font-semibold mb-4">{title}</h2>
              <p className="text-lg leading-relaxed">
                {index === 0 && "LeetPath recommends LeetCode problems based on your past interactions, ensuring each recommendation is tailored to your current skill level."}
                {index === 1 && "LeetPath considers the difficulty levels of problems you've solved, providing a balance of challenge and progression."}
                {index === 2 && "As you solve more problems, the system adapts and ensures the recommendations always reflect your evolving skills."}
                {index === 3 && "A graph-based recommendation engine connects questions dynamically, improving recommendations over time."}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        className="flex flex-col items-center py-10 sm:mb-10"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1 className="text-[2rem] sm:text-[3rem] font-semibold my-5">
          How It Works ✨
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {['Graph-Based Engine', 'Topic Modeling', 'MRF Belief Propagation'].map((title, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <div className="bg-orange-500 p-4 rounded-full mb-4">
                {index === 0 && <FaCogs className="text-white text-3xl" />}
                {index === 1 && <FaBrain className="text-white text-3xl" />}
                {index === 2 && <FaNetworkWired className="text-white text-3xl" />}
              </div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-center mt-2">
                {index === 0 && "Questions are modeled as nodes in a graph structure, with relationships between them reflecting content similarity."}
                {index === 1 && "We identify latent topics to match questions to your specific skill gaps for improved relevance."}
                {index === 2 && "We use belief propagation in Markov Random Fields to refine recommendations based on probabilities."}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack Section */}
      <motion.div 
        className="flex flex-col items-center p-10 my-16 sm:mb-10"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1 className="text-[2rem] sm:text-[3rem] font-semibold leading-[100%] mb-4 pb-4">
          Our Tech Stack 💻
        </h1>
        <div className="flex flex-wrap justify-center gap-6">
          {['nextjs', 'tailwind', 'go', 'mongodb', 'flask', 'firebase', 'graphql', 'vercel', 'gcp'].map((tech, index) => (
            <motion.div
              key={index}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <img src={`https://skillicons.dev/icons?i=${tech}`} alt={tech} className="h-20" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action Section */}
      <motion.div 
        className="flex flex-col items-center py-16 sm:mb-10" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1 className="text-[2rem] text-center sm:text-[3rem] font-semibold leading-[100%] pb-4">
          Ready to Level Up Your LeetCode Game? 🎮
        </h1>
        <h2 className="text-lg sm:text-xl w-[80%] sm:w-[50%] text-center">
          Sign up now to receive personalized question recommendations based on your unique LeetCode journey. Get started with smarter practice today!
        </h2>
        <a href="/register">
          <div className="px-6 py-3 mt-6 rounded-lg text-xl bg-orange-500 text-white hover:bg-orange-400 transition">
            Let&apos;s Go!
          </div>
        </a>
      </motion.div>
    </div>
  );
}
