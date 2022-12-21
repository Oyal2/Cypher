import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './directories/LandingPage';
import { SignIn } from './directories/SignIn';
import { SignUp } from './directories/SignUp';
import { Home } from './directories/Home';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: '/cypher',
    element: <HomePage />,
  },
  {
    path: '/cypher/signin',
    element: <SignIn />,
  },
  {
    path: '/cypher/signup',
    element: <SignUp />,
  },
  {
    path: '/cypher/home',
    element: <Home />,
  },
]);

root.render(<RouterProvider router={router} />);
