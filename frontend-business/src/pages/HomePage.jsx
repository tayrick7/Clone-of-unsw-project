/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';

import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../stores";

function HomePage() {
  const history = useHistory();
  const email = useAuthStore((state) => state.email);
  useEffect(() => {
    if (!email) {
        history.push('/login');
    }
});

  return (
    <div>
      <Container>
        <h1>User Guide</h1>
        <p>1. Upload new data</p>
        <p>2. Select the pipeline</p>
        <p>3. Reject anomalies</p>
        <Button onClick={() => history.push("/upload")}>Start</Button>
      </Container>
    </div>
  );
}

export default HomePage;