import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from './authSlice';

export const AnonymousOnly = () => {
  const user = useSelector(selectMemoizedUser);
  const { id } = user;

  return Boolean(id) ? <Navigate to='/' replace={true} /> : <Outlet />;
};
