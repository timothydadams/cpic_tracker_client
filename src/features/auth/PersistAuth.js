import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useRefreshMutation } from './authApiSlice';
import usePersist from 'hooks/usePersist';
import useTokenRefreshTimer from 'hooks/useTokenRefreshTimer';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from './authSlice';
import { Skeleton } from 'ui/skeleton';

export const PersistAuth = () => {
  const location = useLocation();

  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken);
  const effectRan = useRef(false);
  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isError }] =
    useRefreshMutation();

  // Proactively refresh the access token before it expires
  useTokenRefreshTimer(persist);

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
      const verifyRefreshToken = async () => {
        try {
          await refresh(persist);
          setTrueSuccess(true);
        } catch (e) {
          // refresh failed — handled by error state below
        }
      };
      if (!token) {
        verifyRefreshToken();
      } else {
        setTrueSuccess(true);
      }
    }
    return () => (effectRan.current = true);
  }, []);

  let content;

  if (trueSuccess || (token && isUninitialized)) {
    content = <Outlet />;
  } else if (isLoading) {
    content = <Skeleton className='w-full h-[250px]' />;
  } else if (isError) {
    const allowed = location.pathname.includes('/register');
    content = (
      <Navigate
        to={allowed ? location.pathname : '/login'}
        replace={true}
        state={{ from: location.pathname }}
      />
    );
  }

  return content;
};
