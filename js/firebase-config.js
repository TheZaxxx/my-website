// firebase-config.js
// Konfigurasi Firebase untuk aplikasi MinePoint

const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "minepoint-app.firebaseapp.com",
  projectId: "minepoint-app",
  storageBucket: "minepoint-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export Firebase services
export { auth, db, storage };
