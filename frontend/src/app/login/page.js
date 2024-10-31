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
    <div className='flex flex-col items-center justify-center py-[8%] bg-gray-900'>
      <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Sign In</h1>

        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

        {/* Email and Password Form */}
        <form onSubmit={handleEmailAuth} className='flex flex-col space-y-4'>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            required
          />
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            required
          />

          <button
            type='submit'
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300'>
            Sign In
          </button>
        </form>

        <p className='text-center my-4'>OR</p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl w-full transition duration-300'>
          Sign In with Google
        </button>

        <p className='text-center mt-4'>
          Don’t have an account?
          <button
            type='button'
            className='text-blue-500 hover:underline ml-2'
            onClick={redirectToRegister}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
