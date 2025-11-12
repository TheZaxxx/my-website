// Firebase Configuration
// GANTI dengan config dari Firebase Console Anda


const firebaseConfig = {
  apiKey: "AIzaSyDFjRbWcl8T6p7sEAXzbffu9uk66xCiPfo",
  authDomain: "my-website-users-27cca.firebaseapp.com",
  projectId: "my-website-users-27cca",
  storageBucket: "my-website-users-27cca.firebasestorage.app",
  messagingSenderId: "68032793973",
  appId: "1:68032793973:web:f65498a1abfcbe145e173c",
  measurementId: "G-NFF81CZ4SY"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase berhasil diinisialisasi");
} catch (error) {
    console.error("Error inisialisasi Firebase:", error);
}

// Export database instance
const db = firebase.firestore();
