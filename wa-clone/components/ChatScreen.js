import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { Avatar, IconButton } from "@mui/material";
import { AttachFile, InsertEmoticon, MoreVert } from "@mui/icons-material";
import MicIcon from "@mui/icons-material/Mic";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Message from "./Message";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "react-timeago";
import getRecipientSnapshot from "../utils/getRecipientSnapshot";

function ChatScreen({ chat }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [input, setInput] = useState("");
  const endOfMessageRef = useRef(null);
  const [recipientSnapshot, setRecipientSnapshot] = useState(null);
  const [loadingRecipient, setLoadingRecipient] = useState(true);

  const qMessages = router.query.id
    ? query(collection(db, "chats", router.query.id, "messages"), orderBy("timestamp", "asc"))
    : null;

  const [messagesSnapshot, loadingMessages, errorMessages] = useCollection(qMessages);
  const fetchRecipientSnapshot = () => { // No longer async inside useEffect
    setLoadingRecipient(true); // Set loading to true before fetching
    console.log(chat, user)
    getRecipientSnapshot(chat?.users, user) // Call the function which returns a promise
      .then((snapshot) => {
        console.log("Recipient snapshot:", snapshot);
        setRecipientSnapshot(snapshot);
      })
      .catch((error) => {
        console.error("Error fetching recipient snapshot:", error);

      })
      .finally(() => {
        setLoadingRecipient(false); // Set loading to false after fetch, regardless of success/failure
      });
  };

  useEffect(() => {
    console.log("asd")
    fetchRecipientSnapshot();

    if (chat?.users && user) { // Only fetch if chat and user are available
      fetchRecipientSnapshot();
    } else {
      setRecipientSnapshot(null); // if chat or user is null, set recipientSnapshot to null
      setLoadingRecipient(false); // if chat or user is null, set loading to false
    }
  }, [chat, user, router.query.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesSnapshot]);

  const scrollToBottom = () => {
    if (endOfMessageRef.current) {
      endOfMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      if (user) {
        await setDoc(doc(db, "users", user.uid), { lastSeen: serverTimestamp() }, { merge: true });
      }

      await addDoc(collection(db, "chats", router.query.id, "messages"), {
        timestamp: serverTimestamp(),
        message: input.trim(),
        user: user?.email,
        photoUrl: user?.photoURL,
      });

      setInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    }
  };

  return (
    <Container>
      <Header>
        {loadingRecipient ? (
          <Avatar />
        ) : recipientSnapshot ? (
          <UserAvatar src={recipientSnapshot.data()?.photoUrl} />
        ) : (
          <UserAvatar />
        )}

        <HeaderInfo>
          <Recipient>{getRecipientEmail(chat.users, user)}</Recipient>
          {loadingRecipient ? (
            <TimeStamp>Loading last active...</TimeStamp>
          ) : recipientSnapshot?.data()?.lastSeen ? (
            <TimeStamp>
              Last active: <TimeAgo datetime={recipientSnapshot.data().lastSeen.toDate()} />
            </TimeStamp>
          ) : (
            <TimeStamp>Unavailable</TimeStamp>
          )}
        </HeaderInfo>
        <HeaderIcons>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </HeaderIcons>
      </Header>

      <MessageContainer>
        {loadingMessages && <p>Loading messages...</p>}
        {errorMessages && <p>Error loading messages: {errorMessages.message}</p>}
        {messagesSnapshot &&
          messagesSnapshot.docs.map((message) => (
            <Message
              key={message.id}
              user={message.data().user}
              message={{
                ...message.data(),
                timestamp: message.data().timestamp?.toDate().getTime(),
              }}
            />
          ))}
        <EndOfMessages ref={endOfMessageRef} />
      </MessageContainer>

      <InputContainer onSubmit={sendMessage}>
        <InsertEmoticon />
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button hidden disabled={!input.trim()} type="submit">
          Send Message
        </button>
        <MicIcon />
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;

const Header = styled.div`
  min-height: 14vh;
  background-color: white;
  display: flex;
  align-items: center;
  padding-left: 10px;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0px;
  z-index: 100;
`;

const HeaderIcons = styled.div``;

const HeaderInfo = styled.div`
  flex: 1;
  padding: 0px 10px;
`;

const Recipient = styled.h3`
  margin: 0px;
  padding: 0px;
`;

const TimeStamp = styled.p`
  margin: 0px;
  padding: 0px;
`;

const UserAvatar = styled(Avatar)`
  &:hover {
    opacity: 0.7;
    cursor: pointer;
  }
`;

const MessageContainer = styled.div`
  padding: 30px;
  background-color: #efebd0;
  min-height: 98vh;
  overflow: hidden;
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const Input = styled.input`
  flex: 1;
  outline: 0;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 20px;
  margin-left: 15px;
  margin-right: 15px;
`;

const EndOfMessages = styled.div`
  margin-top: 50px;
`;