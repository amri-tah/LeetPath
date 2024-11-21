'use client';
import React, { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { IoPersonCircleOutline } from "react-icons/io5";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const router = useRouter();
  const auth = getAuth();
  const [image, setImage] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await getUserData(user.email);
        await fetchImage(user.email); // Fetch and display the user’s image
        setLoading(false);

        if (user.email) {
          await updateSolvedWithLeetCode(user.email);
        }
      } else {
        router.push('/register');
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth, router]);

  const updateSolvedWithLeetCode = async (email) => {
    console.log("Update User Info API Called !!");
    try {
      const response = await fetch('https://leetpath-go.onrender.com/updateSolvedWithLeetCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!data.status) {
        console.log("Failed to update solved problems with LeetCode");
      }
    } catch (error) {
      console.log("Error updating solved problems:", error.message);
    }
  };

  const fetchImage = async (email) => {
    const filename = email.replace('@', '-').replace('.', '-') + '.png';
    try {
      const response = await fetch('https://leepath-model.el.r.appspot.com/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });
      if (response.ok) {
        const blob = await response.blob();
        setImage(URL.createObjectURL(blob));
      } else {
        console.log("Failed to fetch image.");
      }
    } catch (error) {
      console.log("Error fetching image:", error.message);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const filename = user.email.replace('@', '-').replace('.', '-') + '.png';
    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', filename);

        const response = await fetch('https://leepath-model.el.r.appspot.com/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.log("Image upload failed.");
        }
      } catch (error) {
        console.log('Error uploading image:', error.message);
      }
    } else {
      alert('Please upload a valid image file');
    }
  };

  const handleDeleteImage = async () => {
    const filename = user.email.replace('@', '-').replace('.', '-') + '.png';
    setImage(null);
    try {
      const response = await fetch('https://leepath-model.el.r.appspot.com/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        console.log("Failed to delete image.");
      }
    } catch (error) {
      console.log("Error deleting image:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/register');
    } catch (error) {
      console.log("Error signing out: ", error.message);
    }
  };

  const getUserData = async (email) => {
    try {
      const response = await fetch('https://leetpath-go.onrender.com/getUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.status) {
        const { _id, ...filteredData } = data;
        setUserData(filteredData);
      } else {
        console.log("Failed to fetch user data");
      }
    } catch (error) {
      console.log("Error fetching user data: ", error.message);
    }
  };

  const handleEditSave = async () => {
    if (isEditing) {
      try {
        const response = await fetch('https://leetpath-go.onrender.com/updateUser', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (data.status) {
          setError('');
          setNotification({ message: 'Profile updated successfully!', type: 'success' });
          setIsEditing(false);
          setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        } else {
          setError('Failed to update user data.');
          setNotification({ message: 'Failed to update user data.', type: 'error' });
          setIsEditing(false);
          setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        }
      } catch (error) {
        console.log("Error updating user data: ", error.message);
        setError('An error occurred while updating.');
        setNotification({ message: 'An error occurred while updating.', type: 'error' });
        setIsEditing(false);
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      }
    } else {
      setIsEditing(true);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className='bg-gray-900 flex flex-row items-start justify-center min-h-screen py-[4%]'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-3/5 mx-4 flex flex-col'>
        <h1 className='text-2xl font-bold text-center'>Profile</h1>
        {user ? (
          <>
            {image ? (
              <img src={image} alt="Profile" className="w-[100px] h-[100px] rounded-full mx-auto my-2" />
            ) : (
              <IoPersonCircleOutline className='w-[100px] h-[100px] mx-auto' />
            )}
            <div className='flex items-center justify-center gap-10'>
              {isEditing && (
                <div>
                  <button
                    onClick={() => document.getElementById('fileInput').click()}
                    className="bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-700 mr-2"
                  >
                    Upload Image
                  </button>
                  <button
                    className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-700"
                    onClick={handleDeleteImage}
                  >
                    Delete Image
                  </button>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
            <p className='text-center mb-4'>Welcome, {user.email}</p>
            {userData ? (
              <div className='flex flex-row'>
                <div className='w-1/2 px-4'>
                  <label className='block text-gray-700'>Username:</label>
                  <input
                    type='text'
                    value={userData.username || ''}
                    className='border p-2 w-full rounded-lg mb-4'
                    readOnly={!isEditing}
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  />
                  <label className='block text-gray-700'>Name:</label>
                  <input
                    type='text'
                    value={userData.name || ''}
                    className='border p-2 w-full rounded-lg mb-4'
                    readOnly={!isEditing}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  />
                  <label className='block text-gray-700'>Institution:</label>
                  <input
                    type='text'
                    value={userData.institution || ''}
                    className='border p-2 w-full rounded-lg mb-4'
                    readOnly={!isEditing}
                    onChange={(e) => setUserData({ ...userData, institution: e.target.value })}
                  />
                  {error && <p className='text-red-500 text-sm'>{error}</p>}
                </div>
                <div className='w-1/2 px-4'>
                  <label className='block text-gray-700 mb-2'>Solved Problems:</label>
                  <div className='grid grid-cols-3 gap-4 mb-4'>
                    <div className='bg-green-200 text-green-800 p-4 rounded-lg text-center'>
                      <p className='font-bold text-lg'>Easy</p>
                      <p className='text-3xl'>{userData.solved?.easy || 0}</p>
                    </div>
                    <div className='bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center'>
                      <p className='font-bold text-lg'>Medium</p>
                      <p className='text-3xl'>{userData.solved?.medium || 0}</p>
                    </div>
                    <div className='bg-red-200 text-red-800 p-4 rounded-lg text-center'>
                      <p className='font-bold text-lg'>Hard</p>
                      <p className='text-3xl'>{userData.solved?.hard || 0}</p>
                    </div>
                  </div>
                  <div className='w-full'>
                    <button
                      onClick={handleEditSave}
                      className={`text-white font-bold py-2 px-4 rounded-xl transition duration-300 w-full mb-2 ${isEditing ? 'bg-orange-500 hover:bg-orange-700' : 'bg-blue-500 hover:bg-blue-700'}`}>
                      {isEditing ? 'Save' : error ? 'Edit' : 'Edit'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300 w-full'>
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading user data...</p>
            )}
          </>
        ) : (
          <p className='text-center mb-4'>You are not logged in.</p>
        )}
      </div>
      {notification.message && (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Profile;
