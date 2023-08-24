import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Login } from './pages/Login.jsx';
import { Feed } from './pages/Feed.jsx';
import { Register } from './pages/Register.jsx';
import { RouteRestrict } from './pages/RouteRestrict.jsx';
import { Call } from './pages/Call.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/feed",
    element:
      <RouteRestrict>
        <Feed />
      </RouteRestrict>
  },
  {
    path: "/register",
    element: <Register />
  }, 
  {
    path: "/call",
    element: <Call/>
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
