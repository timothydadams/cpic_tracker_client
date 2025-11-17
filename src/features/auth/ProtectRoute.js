import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from './authSlice';

export const ProtectRoute = ({ allowedRoles = [], message }) => {
  const location = useLocation();
  const user = useSelector(selectMemoizedUser);
  const { id, roles, isAdmin } = user;
  const userHasRouteRole = roles.some((x) => allowedRoles?.includes(x));

  if (isAdmin) {
    return <Outlet />;
  }

  if (id && (allowedRoles.length === 0 || userHasRouteRole)) {
    return <Outlet />;
  } else {
    if (id) {
      return (
        <Navigate
          to='/unauthorized'
          state={{ from: location, customMessage: message }}
          replace
        />
      );
    }
    return <Navigate to='/login' state={{ from: location }} replace />;
  }
};
