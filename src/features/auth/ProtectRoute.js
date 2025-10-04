import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';

export const ProtectRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const user = useAuth();
  //console.log('user in protectRoute component', user);
  const { id, roles, isAdmin } = user;
  const userHasRouteRole = roles.some((x) => allowedRoles?.includes(x));

  if (isAdmin) {
    return <Outlet />;
  }

  if (id && (allowedRoles.length === 0 || userHasRouteRole)) {
    return <Outlet />;
  } else {
    if (id) {
      return <Navigate to='/unauthorized' state={{ from: location }} replace />;
    }
    return <Navigate to='/login' state={{ from: location }} replace />;
  }
};

/*
  return roles.some((x) => allowedRoles?.includes(x)) ? (
    <Outlet />
  ) : id && allowedRoles.length == 0 ? (
    <Outlet />
  ) : id ? (
    <Navigate to='/unauthorized' state={{ from: location }} replace />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
  
*/
