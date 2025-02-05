import styled from "styled-components";
import { Avatar, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";
import { ChatBubble, MoreVertOutlined, SearchOffRounded } from "@mui/icons-material";
import { collection, query, where, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import UserSearchModal from "./UserSearchModal";

export default function Sidebar() {
  const [user] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(() => user?.email);

  useEffect(() => {
    setUserEmail(user?.email);
  }, [user]);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.signOut();
    handleClose();
  };









  const q = userEmail
    ? query(collection(db, "chats"), where("users", "array-contains", userEmail))
    : null;

  const [chatsSnapShot] = useCollection(q);

  const handleUserSelect = async (selectedUser) => {
    try {
      const chatExists = await chatAlreadyExists(selectedUser.email);
      if (chatExists) {
        alert("Chat already exists");
        return;
      }

      await addDoc(collection(db, "chats"), {
        users: [userEmail, selectedUser.email],
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Error creating chat. Please try again.");
    }
  };

  const chatAlreadyExists = async (recipientEmail) => {
    const chatRef = collection(db, "chats");
    const chatQuery = query(chatRef, where("users", "array-contains", userEmail));
    const chatSnapshot = await getDocs(chatQuery);

    return chatSnapshot.docs.some((chat) =>
      chat.data().users.includes(recipientEmail)
    );
  };

  return (
    <Container>
      <Header>
        <UserAvatar src={user?.photoURL} onClick={handleAvatarClick} />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleClose}>Account</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
        <IconsContainer>
          <IconButton><ChatBubble /></IconButton>
          <IconButton><MoreVertOutlined /></IconButton>
        </IconsContainer>
      </Header>

      <Search>
        <SearchOffRounded />
        <SearchInput placeholder="Search in chats" />
      </Search>

      <SidebarButton onClick={() => setIsModalOpen(true)}>
        Start a new chat
      </SidebarButton>

      {chatsSnapShot?.docs.map((chat) => (
        <Chat key={chat.id} id={chat.id} users={chat.data().users} />
      ))}

      <UserSearchModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserSelect={handleUserSelect}
        excludeEmails={[userEmail]}
        title="Start New Chat"
      />
    </Container>
  );
}

// Styled components remain unchanged

const Container = styled.div`
  flex: 0.45;
  border-right: 1px solid whitesmoke;
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;
const UserAvatar = styled(Avatar)`
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;

const Search = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 2px;
`;

const SearchInput = styled.input`
  outline-width: 0;
  border: none;
  flex: 1;
`;

const SidebarButton = styled(Button)`
  width: 100%;
  &&& {
    border-top: 1px solid whitesmoke;
    border-bottom: 1px solid whitesmoke;
  }
`;
