import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { authReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className='glass-panel-strong rounded-[28px] px-6 py-14 text-center'>
        <p className='font-display text-2xl text-[#1b2235]'>Checking your studio session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth' replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
