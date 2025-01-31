import { Button } from "@material-ui/core";
import React from "react";
import Head from "next/head";
import styled from "styled-components";
import { auth, provider } from "../firebase";
function Login() {
  const SignIn = () => {
    auth.signInWithPopup(provider).catch((err) => alert(err));
  };

  return (
    <Container>
      <Head>
        <title>Login</title>
      </Head>

      <LoginContainer>
        <Logo src="https:\\assets.stickpng.com/images/580b57fcd9996e24bc43c543.png" />
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
const Logo = styled.img`
  height: 200px;
  width: 200px;
  margin-bottom: 50px;
`;
