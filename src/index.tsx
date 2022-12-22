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
import { Settings } from './directories/Settings';
 
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter basename="/cypher">
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
);
