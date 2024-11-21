'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../../config.js';

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
    ["Problems", "/rec"], 
    ["Github", "https://github.com/amri-tah/LeetPath"]
  ]; 
  return (
    <div className='bg-gray-900 px-[10%] pt-6'>
<div className='flex px-10 py-5 text-xl justify-between text-balck bg-white rounded-xl sticky  top-5 '>
      <h1 className='font-lexend'>
        <Link href='/'>{'{LeetPath}'}</Link>
      </h1>
      <div className='flex gap-10 font-montserrat'>
      {Navigations.map((element, index) => (
        <h1 key={index}>
          <Link href={element[1]}>{element[0]}</Link>
        </h1>
      ))}
        {user ? (
          <Link href='/profile'>
            Profile
          </Link>
        ) : (
          <h1>
            <Link href='/register'>Register / Login</Link>
          </h1>
        )}
      </div>
    </div>
    </div>
    
  );
};

export default Navbar;
