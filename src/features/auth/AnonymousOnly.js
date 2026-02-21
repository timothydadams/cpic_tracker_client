import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from './authSlice';

export const AnonymousOnly = () => {
  const user = useSelector(selectMemoizedUser);
  const { id } = user;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const returnTo =
        location.state?.from || sessionStorage.getItem('returnTo') || '/';
      sessionStorage.removeItem('returnTo');
      navigate(returnTo, { replace: true });
    }
  }, [id, location.state, navigate]);

  if (id) return null;
  return <Outlet />;
};
