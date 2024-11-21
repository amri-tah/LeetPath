'use client';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="bg-gray-900 text-white ">
      <Head>
        <title>Adaptive Learning | LeetCode Practice Platform</title>
        <meta name="description" content="An AI-powered platform for personalized coding practice with LeetCode problems." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="py-20 px-[10%]">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Master LeetCode Problems, Your Way 🚀
          </h1>
          <p className="text-lg text-white mb-6 w-[50%] mx-auto">
          LeetPath is a personalized recommendation system for LeetCode users that analyzes user interactions, question similarity, and topic relevance to suggest the best questions for skill improvement. 📈
</p>
          <button className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none transition">
            Get Started 🏁
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-800 px-[10%]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Why Choose LeetPath? 🤔</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-white mb-4">Personalized Problem Recommendations 🔍</h3>
              <p className="text-white">
                Our algorithms assess your strengths and weaknesses to recommend the most relevant problems, helping you improve efficiently.
              </p>
            </div>
            <div className="p-6 border rounded hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-white mb-4">AI-Powered Insights 📊</h3>
              <p className="text-white">
                Get detailed analytics on your problem-solving patterns and progress, powered by probabilistic models for data-driven insights.
              </p>
            </div>
            <div className="p-6 border rounded hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-white mb-4">Track Your Growth 📈</h3>
              <p className="text-white">
                Measure your coding skills with comprehensive progress reports and visualized metrics, so you know exactly where you stand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">How Adaptive Learning Works 🧠</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 text-left">
              <h3 className="text-2xl font-semibold text-white mb-4">Adaptive Algorithms 🔄</h3>
              <p className="text-white">
                Our adaptive engine uses probabilistic models to analyze your performance and adjust the difficulty of problems in real time, ensuring consistent growth and practice.
              </p>
            </div>
            <div className="p-6 text-left">
              <h3 className="text-2xl font-semibold text-white mb-4">Cloud-Powered Scalability ☁️</h3>
              <p className="text-white">
                Hosted on cloud services, our platform scales with your needs, providing a seamless experience whether you’re practicing alone or in a team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Boost Your LeetCode Skills? 💪</h2>
          <p className="text-lg mb-8 text-white">
            Join thousands of learners who are already improving their problem-solving skills with our adaptive learning system. 🌟
          </p>
          <button className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none transition">
            Sign Up Now 🔑
          </button>
        </div>
      </section>
    </div>
  );
}
