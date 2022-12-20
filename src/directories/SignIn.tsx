import React from 'react';
import { useEffect, useState } from 'react';
import '../App.css';

export function SignIn() {
  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const REGISTER_URL = '/api/cypher/login';
  const confirmMessage = 'Successfully signed up!';

  const register = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user === '' || password === '') {
      setResponse('Please fill in all the boxes');
      return;
    }

    const req = {
      username: user,
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
      window.location.href = '/home';
    }
  }, [response]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="signInBox">
        <h4 style={{ textAlign: 'center' }}>Sign In</h4>
        <form onSubmit={register}>
          <div className="btn-group" style={{ marginTop: '3vh' }}>
            <input
              className="input_text"
              type="text"
              id="username"
              name="user"
              placeholder="Enter Username"
              onChange={(e) => {
                setUser(e.target.value);
              }}
            />
          </div>
          <div className="btn-group" style={{ marginTop: '3vh' }}>
            <input
              type="password"
              id="password"
              name="pass"
              placeholder="Enter Password"
              onChange={(e) => {
                setPassword(e.target.value);
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
              href="/forgotPassword"
            >
              Forgot Password!
            </a>
          </h5>
          <div className="btn-group" style={{ marginTop: '6vh' }}>
            <button className="button">Sign In</button>
          </div>
        </form>
        <div className="btn-group" style={{ marginTop: '3vh' }}>
          <a href="/signup">
            <button className="button">New User: Sign Up</button>
          </a>
        </div>
      </div>
    </div>
  );
}
