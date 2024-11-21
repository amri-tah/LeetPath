'use client';
import { FaChartLine, FaBrain, FaNetworkWired, FaCogs } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-gray-900 text-white px-[10%]">
      <div className="flex items-center">
        <motion.div 
          className="w-[50%]"
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1 }}
        >
          <h1 className="text-[4rem] font-semibold leading-[100%]">
            Master LeetCode Problems, Your Way 🚀
          </h1>
          <h2 className="text-xl mt-2">
            LeetPath is a personalized recommendation system for LeetCode users that analyzes user interactions, question similarity, and topic relevance to suggest the best questions for skill improvement. 📈
          </h2>
          <div className="flex gap-3 mt-5">
            <a href="#learnmore">
              <div className="px-5 py-3 rounded-lg text-xl bg-white text-black">
                Learn More
              </div>
            </a>
            <a href="/register">
              <div className="px-5 py-3 rounded-lg text-xl bg-orange-500 text-white">
                Get Started
              </div>
            </a>
          </div>
        </motion.div>

        
        <motion.div 
          className="w-[50%]" 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1 }}
        >
          <Image
            src="/landing.png"
            alt="Landing Image"
            width={1200}   
            height={800}   
            className="w-full" 
          />
        </motion.div>
      </div>

      <motion.div 
        className="bg-gray-900 text-white px-[5%] py-20"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
      >
        <h1 id="learnmore" className="text-[3rem] font-semibold text-center mb-4">
          
        </h1>

        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Feature 1 */}
          <motion.div 
            className="bg-gray-800 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition duration-500 ease-in-out w-full lg:w-[45%]"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-orange-500 px-8 py-4 rounded-full mb-6">
              <FaChartLine className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Personalized Recommendations</h2>
            <p className="text-lg">
              LeetPath recommends LeetCode problems based on your past interactions, question similarity, and topics you&apos;re most likely to excel at, ensuring each recommendation is tailored to your current skill level.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            className="bg-gray-800 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition duration-500 ease-in-out w-full lg:w-[45%]"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-orange-500  px-8 py-4 rounded-full mb-6">
              <FaBrain className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Skill and Difficulty Matching</h2>
            <p className="text-lg">
              LeetPath considers the difficulty levels of problems you&apos;ve solved and provides recommendations that balance challenge and progression, making sure you&apos;re continuously improving.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row justify-between gap-12">
          {/* Feature 3 */}
          <motion.div 
            className="bg-gray-800 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition duration-500 ease-in-out w-full lg:w-[45%]"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-orange-500  px-8 py-4 rounded-full mb-6">
              <FaNetworkWired className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Continuous Learning</h2>
            <p className="text-lg">
              As you solve more problems, the system continuously learns and adapts, ensuring the recommendations always reflect your evolving skill level and learning trajectory.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            className="bg-gray-800 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition duration-500 ease-in-out w-full lg:w-[45%]"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-orange-500  px-8 py-4 rounded-full mb-6">
              <FaCogs className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Graph-Based Approach</h2>
            <p className="text-lg">
              A graph-based recommendation engine builds connections between problems based on content similarity and topic overlap. This results in dynamic, interrelated recommendations that improve over time.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        className="flex flex-col items-center py-10" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h1 className="text-[2rem] font-semibold leading-[100%] my-5">
          How It Works ✨
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-orange-500 p-4 rounded-full mb-4">
              <FaCogs className="text-white text-3xl" />
            </div>
            <h2 className="text-xl font-semibold">Graph-Based Engine</h2>
            <p className="text-center mt-2">
              A graph structure models questions as nodes, with relationships like content similarity and topic overlap as edges. This allows for smarter recommendations based on related questions.
            </p>
          </motion.div>
          <motion.div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-orange-500 p-4 rounded-full mb-4">
              <FaBrain className="text-white text-3xl" />
            </div>
            <h2 className="text-xl font-semibold">Topic Modeling</h2>
            <p className="text-center mt-2">
              Latent topics within questions are identified, helping to improve recommendation relevance by matching questions to your specific skill gaps.
            </p>
          </motion.div>
          <motion.div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-orange-500 p-4 rounded-full mb-4">
              <FaNetworkWired className="text-white text-3xl" />
            </div>
            <h2 className="text-xl font-semibold">MRF Belief Propagation</h2>
            <p className="text-center mt-2">
              A Markov Random Field (MRF) is used for belief propagation, refining recommendations through joint probabilities to ensure they match your skill level and learning preferences.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tech Stack Section */}
      <motion.div 
        className="flex flex-col items-center p-10 my-16" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h1 className="text-[2rem] font-semibold leading-[100%] mb-4">
          Our Tech Stack 💻
        </h1>
        <div className="flex flex-wrap justify-center gap-6">
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=nextjs" alt="Next.js" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=tailwind" alt="Tailwind CSS" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=go" alt="Go" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=mongodb" alt="MongoDB" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=flask" alt="Flask" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=firebase" alt="Firebase" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=graphql" alt="GraphQL" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=vercel" alt="Vercel" className="h-20" />
          </motion.div>
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img src="https://skillicons.dev/icons?i=gcp" alt="GCP" className="h-20 " />
          </motion.div>
        </div>
      </motion.div>
      <motion.div 
        className="flex flex-col items-center py-16" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h1 className="text-[2rem] font-semibold leading-[100%]">
          Ready to Level Up Your LeetCode Game? 🎮
        </h1>
        <h2 className="text-lg w-[50%] text-center">
          Sign up now to receive personalized question recommendations based on your unique LeetCode journey. Get started with smarter practice today!
        </h2>
        <a href="/register">
          <div className="px-5 mt-2 py-3 rounded-lg text-xl bg-orange-500 text-white">
            Let&apos;s Go!
          </div>
        </a>
      </motion.div>
    </div>
  );
}
