import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  BrowserRouter,
  createBrowserRouter,
  HashRouter,
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
  <HashRouter basename="/cypher">
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  </HashRouter>
);
