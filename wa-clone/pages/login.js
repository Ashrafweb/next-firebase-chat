import { Button } from "@mui/material";
import React from "react";
import Head from "next/head";
import styled from "styled-components";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import ChatLogo from "../public/chat_logo.png";
import Image from "next/image";
function Login() {
  const SignIn = async () => {  // Make SignIn async
    try {
      await signInWithPopup(auth, provider); // Use signInWithPopup
      // The user is now signed in.  You might not need to do anything here
      // because your MyApp component should handle the redirect based on auth state.
    } catch (error) {
      console.error("Error signing in:", error); // Use console.error for better debugging
      alert(error.message); // Display a user-friendly error message
    }
  };

  return (
    <Container>
      <Head>
        <title>Login</title>
      </Head>

      <LoginContainer>
        <Image src={ChatLogo} className="loginLogo" />
        <Button variant="outlined" onClick={SignIn}>
          Sign in with Google
        </Button>
      </LoginContainer>
    </Container>
  );
}

export default Login;

const Container = styled.div`
  display: grid;
  place-items: center;
  height: 100vh;
  background-color: #f3f3f3;
`;
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 80px 100px;
  background-color: #ffffff;
  border-radius: 12px;
  align-items: center;
`;
// const Logo = styled.img`
//   height: 200px;
//   width: 200px;
//   margin-bottom: 50px;
// `;
