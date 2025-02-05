import "../styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase"; // Import from your firebase.js file
import Login from "./login";
import Loading from "./loading";
import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions

function MyApp({ Component, pageProps }) {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid); // Create a document reference

      setDoc(
        userRef,
        {
          email: user.email,
          lastSeen: serverTimestamp(), // Use serverTimestamp()
          photoUrl: user.photoURL,
        },
        { merge: true }
      )
        .then(() => {
          console.log("User data updated successfully.");
        })
        .catch((error) => {
          console.error("Error updating user data: ", error);
        });
    }
  }, [user]); // Add user as a dependency

  if (loading) return <Loading />;
  if (!user) return <Login />;
  return <Component {...pageProps} />;
}

export default MyApp;