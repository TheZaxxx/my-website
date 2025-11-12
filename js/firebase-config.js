// Firebase Configuration
// GANTI dengan config dari Firebase Console Anda

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id-here"
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