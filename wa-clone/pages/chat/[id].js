import { collection, query, orderBy, getDocs, getDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import Sidebar from "../../components/Sidebar";
import ChatScreen from "../../components/ChatScreen";
import getRecipientEmail from "../../utils/getRecipientEmail";
import Head from "next/head";
import styled from "styled-components";


function Chat({ chat, messages }) {
  const [user] = useAuthState(auth);

  if (!chat || !messages) {
    return <div>Loading chat data...</div>; // Or a loading indicator component
  }

  return (
    <Container>
      <Head>
        <title>Chat with {getRecipientEmail(chat.users, user)}</title>
      </Head>
      <Sidebar />
      <ChatContainer>
        <ChatScreen chat={chat} messages={messages} /> {/* Pass messages directly */}
      </ChatContainer>
    </Container>
  );
}

export default Chat;

export async function getServerSideProps(context) {
  try {
    const chatRef = doc(db, "chats", context.query.id);

    const messagesQuery = query(
      collection(chatRef, "messages"),
      orderBy("timestamp", "asc")
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().getTime() || null, // Handle potential null timestamp
    }));

    const chatSnapshot = await getDoc(chatRef);

    if (!chatSnapshot.exists()) {
      return {
        notFound: true, // or redirect
      }
    }

    const chatData = chatSnapshot.data();

    const chat = {
      id: chatSnapshot.id,
      ...chatData,
      createdAt: chatData.createdAt?.toDate().toISOString() || null, // Use ISO string
      lastSeen: chatData.lastSeen?.toDate().toISOString() || null, // Use ISO string
    };


    return {
      props: {
        messages: JSON.stringify(messages), // Keep messages as JSON string for initial render
        chat: chat, // Pass chat object directly
      },
    };
  } catch (error) {
    console.error("Error fetching chat data:", error);
    return {
      props: {
        messages: JSON.stringify([]),
        chat: null, // or {} if you prefer an empty object
      },
    };
  }
}

const Container = styled.div`
  display: flex;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow: scroll;
  height: 100vh;

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;