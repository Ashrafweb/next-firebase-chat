import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBQX76r1aVxW2Ms-la-hH5AuXC-MEt7U6I",
  authDomain: "whatsapp-clone-457a5.firebaseapp.com",
  projectId: "whatsapp-clone-457a5",
  storageBucket: "whatsapp-clone-457a5.appspot.com",
  messagingSenderId: "318967518845",
  appId: "1:318967518845:web:98a17871fe33c01d434314",
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
