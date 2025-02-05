// utils/getRecipientSnapshot.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Import your Firestore instance

async function getRecipientSnapshot(chatUsers, currentUser) {
    if (!chatUsers || !currentUser) {
        return null; // Handle cases where chatUsers or currentUser is missing
    }

    try {
        const recipientEmail = getRecipientEmail(chatUsers, currentUser); // Assuming you have this utility
        if (!recipientEmail) return null; // handle if recipient email is not found

        const qRecipient = query(
            collection(db, "users"),
            where("email", "==", recipientEmail)
        );
        console.log("Recipient query:", qRecipient);

        const recipientSnapshot = await getDocs(qRecipient);

        if (!recipientSnapshot.empty) {
            console.log("Recipient snapshot:", recipientSnapshot.docs[0]);
            return recipientSnapshot.docs[0]; // Return the document snapshot

        } else {
            return null; // Return null if no recipient is found
        }
    } catch (error) {
        console.error("Error getting recipient snapshot:", error);
        return null; // Return null on error
    }
}

// Assuming getRecipientEmail is defined elsewhere (e.g., utils/getRecipientEmail.js)
// and imported here.  If not, define it here:
function getRecipientEmail(users, user) {
    return users?.find((userEmail) => userEmail !== user?.email);
}

export default getRecipientSnapshot;