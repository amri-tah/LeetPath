import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { FaGoogle, FaGithub, FaFacebook, FaMicrosoft } from "react-icons/fa";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJ_DOMAIN,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};
import { jwtDecode } from "jwt-decode";

const app = initializeApp(firebaseConfig);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const getUserToken = () => {
    chrome.runtime.sendMessage({ action: "getUserToken" }, (response) => {
      const retrievedToken = response.token;
      console.log("Token retrieved in Login component:", retrievedToken);
      if (retrievedToken) {
        setToken(retrievedToken);
        navigate("/profile");
      }
    });
  };
  useEffect(() => {
    getUserToken();
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        if (decodedToken.email) {
          console.log("User email from token:", decodedToken.email);
          navigate("/profile");
        } else {
          console.error("Email not found in token!");
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      console.log("No token found in localStorage.");
    }
  }, [navigate]);

  const handleSocialSignIn = async (provider) => {
    const auth = getAuth(app);
    try {
      await signInWithPopup(auth, provider);
      navigate("/profile");
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        setError(
          "Account exists with a different credential. Please log in with that credential."
        );
      } else {
        setError("Error signing in: " + error.message);
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);
      navigate("/profile");
    } catch (error) {
      setError("Error with email authentication: " + error.message);
    }
  };

  // const redirectToRegister = () => {
  //   navigate("/register");
  // };

  return (
    <div className="flex flex-col items-center justify-center w-96 bg-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleEmailAuth} className="flex flex-col space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300"
          >
            Sign In
          </button>
        </form>

        <p className="text-center my-4">OR</p>
        <div className="flex justify-center space-x-2">
          <a href="https://leetpath.vercel.app/login"  target="_blank" >
          <button
            onClick={() => handleSocialSignIn(new GoogleAuthProvider())}
            className="flex items-center justify-center bg-red-500 hover:bg-red-700 text-white font-bold w-12 h-12 rounded-lg transition duration-300"
          >
            <FaGoogle className="text-lg" />
          </button>
          </a>
          <a href="https://leetpath.vercel.app/login"  target="_blank" > 

          <button
            onClick={() => handleSocialSignIn(new FacebookAuthProvider())}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-800 text-white font-bold w-12 h-12 rounded-lg transition duration-300"
          >
            <FaFacebook className="text-lg" />
          </button>
          </a>
          <a href="https://leetpath.vercel.app/login"  target="_blank" > 
          <button

            onClick={() => handleSocialSignIn(new GithubAuthProvider())}
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white font-bold w-12 h-12 rounded-lg transition duration-300"
          >
            <FaGithub className="text-lg" />
          </button>
          </a>
          <a href="https://leetpath.vercel.app/login"  target="_blank" > 
          <button
            onClick={() =>
              handleSocialSignIn(new OAuthProvider("microsoft.com"))
            }
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold w-12 h-12 rounded-lg transition duration-300"
          >
            <FaMicrosoft className="text-lg" />
          </button>
          </a>
        </div>

        <p className="text-center mt-4">
          Dont have an account?
          {/* <button
            type="button"
            className="text-blue-500 hover:underline ml-2"
            onClick={redirectToRegister}
          >
            Sign Up
          </button> */}
          <a href="https://leetpath.vercel.app/register" target="_blank" className="text-blue-500 hover:underline ml-2">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;