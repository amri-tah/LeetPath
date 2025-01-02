'use client';
import React, { useState, useEffect } from 'react';
import app from "../../../config.js"; // Ensure this path is correct for your setup
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';

const Login = () => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/profile"); // Redirect to profile if user is already logged in
      }
    });
    return () => unsub();
  }, [router]);

  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch (error) {
      setError("Error signing in with Google: " + error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/profile");
    } catch (error) {
      setError("Error with email authentication: " + error.message);
    }
  };

  const redirectToRegister = () => {
    router.push("/register"); // Redirect to register if user does not have an account
  };

  return (
    <div className="bg-gray-900 flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 md:px-10">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Sign In
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleEmailAuth} className="flex flex-col space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 text-sm sm:text-base">
            Sign In
          </button>
        </form>

        <p className="text-center my-4 text-gray-500">OR</p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-300 text-sm sm:text-base">
          Sign In with Google
        </button>

        <p className="text-center mt-4 text-gray-600">
          Don’t have an account?{' '}
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={redirectToRegister}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
