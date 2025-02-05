import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBQX76r1aVxW2Ms-la-hH5AuXC-MEt7U6I",
    authDomain: "whatsapp-clone-457a5.firebaseapp.com",
    projectId: "whatsapp-clone-457a5",
    storageBucket: "whatsapp-clone-457a5.firebasestorage.app",
    messagingSenderId: "318967518845",
    appId: "1:318967518845:web:98a17871fe33c01d434314"
};

let app; // Declare app outside the conditional

if (!getApps().length) { // Check if an app already exists
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0]; // Use the existing app
}


// Get Firestore instance
const db = getFirestore(app);

// Get Auth instance
const auth = getAuth(app);

// Create a Google Auth provider
const provider = new GoogleAuthProvider();

export { db, auth, provider };