import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from 'react-router-dom';
import { HomePage } from './directories/LandingPage';
import { SignIn } from './directories/SignIn';
import { SignUp } from './directories/SignUp';
import { Home } from './directories/Home';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/cypher" element={<HomePage />} />
      <Route path="/cypher/signin" element={<SignIn />} />
      <Route path="/cypher/signup" element={<SignUp />} />
      <Route path="/cypher/home" element={<Home />} />
    </Routes>
  </BrowserRouter>
);
