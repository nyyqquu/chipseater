// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaCR-s4JJB_T1L7nT-vuo0opGAsu8cPqM",
  authDomain: "crisptracker-f5241.firebaseapp.com",
  projectId: "crisptracker-f5241",
  storageBucket: "crisptracker-f5241.firebasestorage.app",
  messagingSenderId: "288674947284",
  appId: "1:288674947284:web:1c81a0e365dcd09a2b1b41"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log('🔥 Firebase initialized!');
