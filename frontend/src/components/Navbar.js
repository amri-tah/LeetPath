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
    ["Problems", "/#"], 
    ["Team", "/#"]
  ]; 
  return (
    <div className='flex px-10 py-5 text-xl justify-between mx-10 my-5 text-white bg-black rounded-xl top-5 sticky'>
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
            <Link href='/login'>Login</Link>
          </h1>
        )}
      </div>
    </div>
  );
};

export default Navbar;
