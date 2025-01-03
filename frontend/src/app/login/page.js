'use client';
import React, { useState, useEffect } from 'react';
import app from "../../../config.js"; // Ensure this path is correct for your setup
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub, FaFacebook, FaMicrosoft } from 'react-icons/fa';

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

  const handleSocialSignIn = async (provider) => {
    const auth = getAuth(app);
    try {
      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch (error) {
      if(error.code==="auth/account-exists-with-different-credential"){
        setError("Account exists with a different credential. Please log in with that credential.");
      }else{
        setError("Error signing in: " + error.message);
      }
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
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900'>
      <div className='bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-sm sm:max-w-md w-full'>
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

        {/* Social Sign-In Buttons */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => handleSocialSignIn(new GoogleAuthProvider())}
            className='flex items-center justify-center bg-red-500 hover:bg-red-700 text-white font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition duration-300'>
            <FaGoogle className='text-lg' />
          </button>
          <button
            onClick={() => handleSocialSignIn(new FacebookAuthProvider())}
            className='flex items-center justify-center bg-blue-600 hover:bg-blue-800 text-white font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition duration-300'>
            <FaFacebook className='text-lg' />
          </button>
          <button
            onClick={() => handleSocialSignIn(new GithubAuthProvider())}
            className='flex items-center justify-center bg-blue-600 hover:bg-blue-800 text-white font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition duration-300'>
            <FaGithub className='text-lg' />
          </button>
          <button
            onClick={() => handleSocialSignIn(new OAuthProvider('microsoft.com'))}
            className='flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition duration-300'>
            <FaMicrosoft className='text-lg sm:text-xl' />
          </button>
        </div>
        <p className='text-center mt-4 text-sm sm:text-base'>
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