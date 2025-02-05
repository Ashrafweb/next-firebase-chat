import styled from "styled-components";
import getRecipientEmail from "../utils/getRecipientEmail";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { useRouter } from "next/router";
import { Avatar } from "@mui/material";
import { collection, query, where } from "firebase/firestore"; // Import necessary Firestore functions

function Chat({ id, users }) {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const recipientEmail = getRecipientEmail(users, user);

  // Construct the Firestore query
  const q = query(
    collection(db, "users"), // Reference to the "users" collection
    where("email", "==", recipientEmail) // The query condition
  );

  const [recipientSnapshot] = useCollection(q); // Use the query 'q'

  const recipient = recipientSnapshot?.docs?.[0]?.data();

  const enterChat = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <Container onClick={enterChat}>
      {recipient ? (
        <UserAvatar src={recipient?.photoUrl} />
      ) : (
        <UserAvatar>{recipientEmail[0]}</UserAvatar>
      )}

      <p>{recipientEmail}</p>
    </Container>
  );
}

export default Chat;

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-word;

  &:hover {
    background-color: whitesmoke;
  }
`;

const UserAvatar = styled(Avatar)`
  margin: 5px;
  margin-right: 15px;
`;
