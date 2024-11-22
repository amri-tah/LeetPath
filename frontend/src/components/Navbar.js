'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../../config.js';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const Navigations = [
    ["Home", "/#"],
    ["Problems", user? "/rec": "/temp"],
    ["Github", "https://github.com/amri-tah/LeetPath"]
  ];

  return (
    <div 
      className='bg-gray-900 px-[10%] pt-6'
    >
      <motion.div 
        className='flex px-10 py-5 text-xl justify-between text-black bg-white rounded-xl sticky top-0 z-50 shadow-lg'
        whileHover={{ scale: 1.05 }} 
        transition={{ duration: 0.3 }}
      >
        <h1 className='font-lexend'>
          <Link href='/'>{'{LeetPath}'}</Link>
        </h1>
        <div className='flex gap-10 font-montserrat'>
          {Navigations.map((element, index) => (
            <motion.h1 
              key={index}
              whileHover={{ color: '#f59e0b', scale: 1.1 }} // Hover effect for navigation links
              transition={{ duration: 0.2 }}
            >
              <Link href={element[1]}>{element[0]}</Link>
            </motion.h1>
          ))}
          {user ? (
            <motion.h1 
              whileHover={{ color: '#f59e0b', scale: 1.1 }} // Hover effect for Profile
              transition={{ duration: 0.2 }}
            >
              <Link href='/profile'>Profile</Link>
            </motion.h1>
          ) : (
            <motion.h1
              whileHover={{ color: '#f59e0b', scale: 1.1 }} // Hover effect for Register/Login
              transition={{ duration: 0.2 }}
            >
              <Link href='/register'>Register / Login</Link>
            </motion.h1>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Navbar;