import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export const AnonymousOnly = () => {
  const user = useAuth();
  return user.id !== null ? <Navigate to='home' replace={true} /> : <Outlet />;
};
