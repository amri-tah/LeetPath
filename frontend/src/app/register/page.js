'use client';
import React, { useState } from 'react';
import app from "../../../config.js"; // Ensure this path is correct for your setup
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      console.log(userEmail);
      await addUserToAPI(userEmail);

      router.push("/profile");
    } catch (error) {
      setError("Error signing in with Google: " + error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      await addUserToAPI(userEmail);

      router.push("/profile");
    } catch (error) {
      setError("Error with email authentication: " + error.message);
    }
  };

  const addUserToAPI = async (userEmail) => {
    try {
      const response = await fetch('https://leetpath-go.onrender.com/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      if (!data.status) {
        console.error("Failed to add user:", data.message);
      }
    } catch (error) {
      console.error("Error adding user:", error.message);
    }
  };

  return (
    <div className='bg-gray-900 flex flex-col items-center justify-center py-[5%]'>
      <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Sign Up</h1>

        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

        {/* Registration Form */}
        <form onSubmit={handleEmailAuth} className='flex flex-col space-y-4'>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Full Name'
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            required
          />
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
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Confirm Password'
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            required
          />

          <button
            type='submit'
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300'>
            Sign Up
          </button>
        </form>

        <p className='text-center my-4'>OR</p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl w-full transition duration-300'>
          Sign Up with Google
        </button>
        
        <p className='text-center mt-4'>
          Already have an account?
          <button
            type='button'
            className='text-blue-500 hover:underline ml-2'
            onClick={() => router.push('/login')}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
