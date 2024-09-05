import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
    const token = Cookies.get('token');
    const csrfToken = Cookies.get('csrf_token');
    const location = useLocation();
    if (!token || !csrfToken) {
      // If tokens are not present, redirect to the login page
      return <Navigate to="/" replace />;
    }
    
    
    // If tokens are present, render the requested component
    return <Outlet />;
  };
  
  export default ProtectedRoute;