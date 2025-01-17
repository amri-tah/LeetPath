"use client";
import React, { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaTruckLoading } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const auth = getAuth();
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const redirectToRec = () => {
    navigate("/rec");
  };
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("userToken");
      console.log("Retrieved token:", token);

      if (token) {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        if (decodedToken?.email) {
          const userDetails = decodedToken?.email;
          console.log("user" + decodedToken?.email);
          setUser(decodedToken?.email);
          await updateSolvedWithLeetCode(userDetails.email);
          setLoading(false);
        } else {
          console.error("Invalid token: email not found.");
          navigate("/");
          setLoading(false);
        }
      } else {
        console.log("No token found in localStorage.");
        navigate("/");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      navigate("/");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect is running");
    fetchUserDetails();
    getUserData();
  }, []);

  // useEffect(() => {
  //   const auth = getAuth();
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       console.log("User logged in:", user.email);
  //       setUser(user);
  //       setLoading(false);
  //     } else {
  //       console.log("User not logged in");
  //       navigate("/");
  //     }
  //   });
  // }, [navigate]);

  const updateSolvedWithLeetCode = async (email) => {
    console.log("Update User Info API Called !!");
    try {
      const response = await fetch(
        "http://127.0.0.1:8080/updateSolvedWithLeetCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!data.status) {
        console.log("Failed to update solved problems with LeetCode");
      }
    } catch (error) {
      console.log("Error updating solved problems:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/register");
    } catch (error) {
      console.log("Error signing out: ", error.message);
    }
  };
  const getUserData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const decodedToken = jwtDecode(token);
      const email = decodedToken?.email;

      if (!email) {
        console.error("Email not found in the token");
        return;
      }
      const response = await fetch("http://127.0.0.1:8080/getUserData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Fetched user data:", data);

      if (data.status) {
        const { _id, ...filteredData } = data;
        setUserData(filteredData);
        console.log("filtered data " + filteredData);
        console.log(filteredData.username);

        console.log("setted user data value " + userData);
      } else {
        console.log("Failed to fetch user data");
      }
    } catch (error) {
      console.log("Error fetching user data: ", error.message);
    }
  };

  if (loading) return;
  <p>Loading...</p>;

  return (
    <div className="bg-gray-900 flex items-start justify-center min-h-screen w-96 ">
      <div className="bg-gray-100 p-4 rounded-lg shadow-lg w-auto h-auto flex flex-col m-6">
        <h1 className="text-2xl font-bold text-center">Profile</h1>
        {user ? (
          <>
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="w-[100px] h-[100px] rounded-full mx-auto my-2"
              />
            ) : (
              <IoPersonCircleOutline className="w-[80px] h-[80px] mx-auto" />
            )}
            <p className="text-center mb-2 text-lg font-bold">
              Welcome, {userData.username}
            </p>
            {userData ? (
              <div className="flex flex-col">
                <div className="w-full rounded-xl p-4">
                  <label className="block text-gray-700 mb-3 text-base font-bold text-center">
                    Solved Problems
                  </label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-200 text-green-800 px-3 py-4 rounded-lg text-center items-center">
                      <p className="font-bold text-sm">Easy</p>
                      <p className="text-lg">{userData.solved?.easy || 0}</p>
                    </div>
                    <div className="bg-yellow-200 text-yellow-800 px-3 py-4 rounded-lg text-center items-center">
                      <p className="font-bold text-sm">Medium</p>
                      <p className="text-lg">{userData.solved?.medium || 0}</p>
                    </div>
                    <div className="bg-red-200 text-red-800 px-3 py-4 rounded-lg text-center">
                      <p className="font-bold text-sm">Hard</p>
                      <p className="text-lg">{userData.solved?.hard || 0}</p>
                    </div>
                  </div>
                  <div className="w-full flex-col space-y-2">
                    <button
                      onClick={redirectToRec}
                      className="bg-green-500 hover:bg-green-700 text-gray-200 font-bold py-2 px-4 rounded-xl transition duration-300 w-full p-2 hover:text-white"
                    >
                      Questions
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-800 text-gray-200 font-bold py-2 px-4 rounded-xl transition duration-300 w-full p-2 hover:text-white"
                    >
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
          <p className="text-center mb-4">You are not logged in.</p>
        )}
      </div>
      {notification.message && (
        <div
          className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white transition-opacity duration-300 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Profile;
