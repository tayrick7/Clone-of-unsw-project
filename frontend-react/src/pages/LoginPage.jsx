/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../stores";

function LoginPage() {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);

  const authenticateUser = async (email, password) => {
    try {

      if (import.meta.env.MODE === 'development') {
        return true;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Authentication/login`, {
        email,
        password,
      });

      if (!response.status === 200) {
        return false;
      }
      console.log(`token is ${response.data.token}`)
      const token = response.data.token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Session-Token'] = `${token}`;
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isAuthenticated = await authenticateUser(email, password);
    if (isAuthenticated) {
      localStorage.setItem('email', email);
      
      login(email);

      history.push('/');
    }
  }

  return (
    <>
      <style>
        {`
          body {
            background-image: url(/Background.png);
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            margin: 0; /* Removes default margin */
          }
          .login-container {
            background-color: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px; /* Space above the title */
            margin-bottom: 10px; /* Space below the button */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden; /* Ensure the padding and border radius take effect */
          }
        `}
      </style>
      <Container className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="login-container w-100" style={{ maxWidth: '320px' }}>
          <h1 className="text-center">Login</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </div>
      </Container>
    </>
  );
}

export default LoginPage;
