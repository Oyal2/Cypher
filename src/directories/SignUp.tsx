import React from 'react';
import { useEffect, useState } from 'react';
import { redirect } from 'react-router-dom';
import '../App.css';

export function SignUp() {
  const REGISTER_URL = '/api/cypher/register';
  const confirmMessage = 'Successfully signed up!';

  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  const register = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      email === '' ||
      username === '' ||
      password === '' ||
      confirmPassword === ''
    ) {
      setResponse('Please fill in all the boxes');
      return;
    }

    if (password !== confirmPassword) {
      setResponse("Passwords don't match");
      return;
    }

    const req = {
      email: email,
      username: username,
      password: password,
    };

    const options = {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1',
      },
      body: JSON.stringify(req),
    };

    fetch(REGISTER_URL, options)
      .then((response) => response.json())
      .then((response) => {
        if (response.error === '') {
          setResponse(confirmMessage);
        } else {
          setResponse(response.error);
        }
      })
      .catch((err) => setResponse(err));
  };

  useEffect(() => {
    if (response === confirmMessage) {
      window.location.href = '/cypher/signin';
    }
  }, [response]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        marginTop: '-15vh',
      }}
    >
      <div className="signInBox">
        <h4 style={{ textAlign: 'center' }}>Sign Up</h4>
        <form onSubmit={register}>
          <div className="btn-group" style={{ marginTop: '3vh' }}>
            <input
              type="email"
              id="email"
              name="email"
              maxLength={255}
              placeholder="Enter Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div className="btn-group" style={{ marginTop: '1vh' }}>
            <input
              className="input_text"
              type="text"
              id="username"
              name="username"
              maxLength={255}
              placeholder="Enter Username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </div>
          <div className="btn-group" style={{ marginTop: '1vh' }}>
            <input
              type="password"
              maxLength={255}
              id="password"
              name="password"
              placeholder="Enter Password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <div className="btn-group" style={{ marginTop: '1vh' }}>
            <input
              type="password"
              id="confirm-password"
              maxLength={255}
              name="confirm-password"
              placeholder="Confirm Password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </div>
          <h4
            style={{
              fontSize: '2vh',
              textAlign: 'center',
              color: response === confirmMessage ? '#0c1c4a' : '#AA0303',
            }}
          >
            {response}
          </h4>
          <h5>
            <a
              style={{ color: '#0c1c4a', float: 'right' }}
              href="/cypher/forgotPassword"
            >
              Forgot Password!
            </a>
          </h5>
          <div className="btn-group" style={{ marginTop: '6vh' }}>
            <button className="button" type="submit">
              Sign Up
            </button>
          </div>
        </form>
        <div className="btn-group" style={{ marginTop: '3vh' }}>
          <a href="/cypher/signin">
            <button className="button">Existing User: Sign In</button>
          </a>
        </div>
      </div>
    </div>
  );
}
