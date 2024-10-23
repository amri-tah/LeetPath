'use client';
import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    } else {
      router.push('/register'); 
    }
  }, [auth, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/register'); // Redirect to Register after logout
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className='flex flex-col items-center justify-center mt-[10%]'>
      <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Profile</h1>
        {user ? (
          <>
            <p className='text-center mb-4'>Welcome, {user.email}</p>
            <button
              onClick={handleLogout}
              className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300 w-full'>
              Log Out
            </button>
          </>
        ) : (
          <p className='text-center mb-4'>You are not logged in.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
