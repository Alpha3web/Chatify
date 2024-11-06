import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../../socket-client';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    if (!username.trim() || !password.trim()) {
      event.preventDefault();
      setError('Please fill in both username and password');
      return;
    }

    // try {
    //   const response = await axios.post('/api/login', {
    //     username,
    //     password,
    //   });
    //   if (response.status === 200) {
      
    //     navigate("/messages", {state: true});
    //   }
    // } catch (err) {
    //   setError(err);
    // }
  };

  return (
    <form method='POST' action='/api/login' onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;