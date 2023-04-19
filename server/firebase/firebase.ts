// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKXrLF3cUN3sv99iYK5NgpUqY1RUNsf4E",
  authDomain: "sealkey-dca32.firebaseapp.com",
  projectId: "sealkey-dca32",
  storageBucket: "sealkey-dca32.appspot.com",
  messagingSenderId: "233708441881",
  appId: "1:233708441881:web:21a4bcc89846c417f5b588",
  measurementId: "G-HVQ4BD150Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default getFirestore();
