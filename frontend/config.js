// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtBS-yRqdcHMdCcpufxQk2Rwmu7Tn-g7U",
  authDomain: "leetpath-f602e.firebaseapp.com",
  projectId: "leetpath-f602e",
  storageBucket: "leetpath-f602e.firebasestorage.app",
  messagingSenderId: "839479640668",
  appId: "1:839479640668:web:322ecef683ec6f3be7dc99",
  measurementId: "G-YC6R1TFTXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;
