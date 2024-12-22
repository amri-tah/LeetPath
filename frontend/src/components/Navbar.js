'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../../config.js';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage mobile menu visibility
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const Navigations = [
    ["Home", "/#"],

    ["Problems", user ? "/rec" : "/temp"],
    ["Github", "https://github.com/amri-tah/LeetPath"]
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the menu state on mobile
  };

  // Function to close the menu after a link is clicked
  const closeMenu = () => {
    setIsMenuOpen(false); // Close the menu
  };

  return (
    <div className="bg-gray-900 px-6 pt-6">
      <motion.div
        className="flex items-center justify-between px-10 py-5 text-xl text-black bg-white rounded-xl sticky top-0 z-50 shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo Section */}
        <h1 className="font-lexend text-2xl">
          <Link href="/">{'{LeetPath}'}</Link>
        </h1>

        {/* Hamburger Icon for Mobile */}
        <div className="block lg:hidden" onClick={toggleMenu}>
          <button className="text-black">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex gap-12 font-montserrat">
          {Navigations.map((element, index) => (
            <motion.h1
              key={index}
              whileHover={{ color: '#f59e0b', scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="text-lg"
            >
              <Link href={element[1]}>{element[0]}</Link>
            </motion.h1>
          ))}
          {/* Conditionally render Register / Login based on the user state */}
          {!user && (
            <motion.h1
              whileHover={{ color: '#f59e0b', scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="text-lg"
            >
              <Link href="/register">Register / Login</Link>
            </motion.h1>
          )}
        </div>
      </motion.div>

      {/* Mobile Menu - Toggle visibility based on isMenuOpen state */}
      <div
        className={`lg:hidden bg-gray-900 text-white absolute top-16 left-0 w-full ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="flex flex-col items-center py-4 mt-10">
          {Navigations.map((element, index) => (
            <motion.h1
              key={index}
              whileHover={{ color: '#f59e0b', scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="py-2 text-lg"
            >
              <Link href={element[1]} onClick={closeMenu}>
                {element[0]}
              </Link>
            </motion.h1>
          ))}
          {/* Conditionally render Register / Login in the mobile menu */}
          {!user && (
            <motion.h1
              whileHover={{ color: '#f59e0b', scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="py-2 text-lg"
            >
              <Link href="/register" onClick={closeMenu}>
                Register / Login
              </Link>
            </motion.h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
