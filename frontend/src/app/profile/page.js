'use client';
import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        await getUserData(currentUser.email); 
        setLoading(false);  
      } else {
        router.push('/register');
        setLoading(false);
      }
    };
    fetchUserData();
  }, [auth, router]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/register');
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  };


  const getUserData = async (email) => {
    try {
      const response = await fetch('https://leetpath.onrender.com/getUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.status) {
        setUserData(data); 
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error.message);
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
            {userData ? (
              <div className='mb-4'>
                <label className='block text-gray-700'>Username:</label>
                <input
                  type='text'
                  value={userData.username || ''}
                  className='border p-2 w-full rounded-lg mb-4'
                  readOnly
                />
      
                <label className='block text-gray-700'>Name:</label>
                <input
                  type='text'
                  value={userData.name || ''}
                  className='border p-2 w-full rounded-lg mb-4'
                  readOnly
                />

                <div className='mb-4'>
                  <label className='block text-gray-700 mb-2'>Solved Problems:</label>
                  <div className='grid grid-cols-3 gap-4'>
                    {/* Easy Problems */}
                    <div className='bg-green-200 text-green-800 p-4 rounded-lg text-center'>
                      <p className='font-bold text-lg'>Easy</p>
                      <p className='text-3xl'>{userData.solved?.easy || 0}</p>
                    </div>
                    {/* Medium Problems */}
                    <div className='bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center'>
                      <p className='font-bold text-lg'>Medium</p>
                      <p className='text-3xl'>{userData.solved?.medium || 0}</p>
                    </div>
                    {/* Hard Problems */}
                    <div className='bg-red-200 text-red-800 p-4 rounded-lg text-center'>
                      <p className='font-bold text-lg'>Hard</p>
                      <p className='text-3xl'>{userData.solved?.hard || 0}</p>
                    </div>
                  </div>
                </div>

                <label className='block text-gray-700'>Institution:</label>
                <input
                  type='text'
                  value={userData.institution || ''}
                  className='border p-2 w-full rounded-lg mb-4'
                  readOnly
                />
              </div>
            ) : (
              <p>Loading user data...</p>
            )}

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