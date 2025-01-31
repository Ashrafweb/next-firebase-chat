import { Avatar, IconButton } from "@material-ui/core";
import { AttachFile, InsertEmoticon } from "@material-ui/icons";
import MoreVert from "@material-ui/icons/MoreVert";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
//import Image from "next/image";
import firebase from "firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import MicIcon from "@material-ui/icons/Mic";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
function ChatScreen({ chat, messages }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [input, setInput] = useState("");
  const endOfMessageRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [messagesSnapShot] = useCollection(
    db
      .collection("chats")
      .doc(router.query.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );

  const [recipientSnapShot] = useCollection(
    db
      .collection("users")
      .where("email", "==", getRecipientEmail(chat.users, user))
  );

  
  const showMessages = () => {
    if (messagesSnapShot) {
      return messagesSnapShot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime(),
          }}
        />
      ));
    } else {
     return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
   }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    db.collection("users").doc(user.uid).set(
      {
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    db.collection("chats").doc(router.query.id).collection("messages").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user.email,
      photoUrl: user.photoURL,
    });

    setInput("");
    scrollToBottom();
  };

  const recipient = recipientSnapShot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users, user);

  return (
    <Container>
      <Header>
        {recipient ? <UserAvatar src={recipient?.photoUrl} /> : <UserAvatar />}
        <Headerinfo>
          <Recipient>{recipientEmail}</Recipient>
          {recipientSnapShot ? (
            <TimeStamp>
              Last active :{" "}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </TimeStamp>
          ) : (
            <TimeStamp>Loading last active...</TimeStamp>
          )}
        </Headerinfo>
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
        {showMessages()}
        <EndOfMessages ref={endOfMessageRef} />
      </MessageContainer>

      <InputContainer>
        <InsertEmoticon />
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
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
  width: 100%;
  align-items: center;
  padding-left: 10px;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0px;
  z-index: 100;
`;

const HeaderIcons = styled.div``;

const Headerinfo = styled.div`
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
