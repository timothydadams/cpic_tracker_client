import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export const AnonymousOnly = () => {
  const user = useAuth();
  const { id } = user;
  return Boolean(id) ? <Navigate to='home' replace={true} /> : <Outlet />;
};
