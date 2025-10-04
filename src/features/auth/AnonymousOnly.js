import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

export const AnonymousOnly = () => {
  const isAuthenticated = !!Cookies.get('cpic_isAuthenticated');
  return isAuthenticated ? <Navigate to='home' replace={true} /> : <Outlet />;
};
