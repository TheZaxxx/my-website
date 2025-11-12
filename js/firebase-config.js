// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Auth functions
async function registerUser(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

function getAuthErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'Email already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.'
    };
    
    return messages[errorCode] || 'An error occurred. Please try again.';
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is logged in:', user.email);
        // Update UI for logged in state
        const dashboardBtn = document.querySelector('.dashboard-btn');
        if (dashboardBtn) {
            dashboardBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
        }
    } else {
        console.log('User is logged out');
    }
});
