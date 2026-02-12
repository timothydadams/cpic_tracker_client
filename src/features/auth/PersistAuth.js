import {
  Outlet,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useRefreshMutation, useSendLogoutMutation } from './authApiSlice';
import usePersist from 'hooks/usePersist';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from './authSlice';
import { Loading } from 'components/Spinners';
import { Error } from 'components/Generic';
import { Skeleton } from 'ui/skeleton';

export const PersistAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken);
  const effectRan = useRef(false);
  const [trueSuccess, setTrueSuccess] = useState(false);

  const [sendLogout] = useSendLogoutMutation();

  const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] =
    useRefreshMutation();

  useEffect(() => {
    //console.log('persist auth token:', token, isAuthenticated);
    if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
      const verifyRefreshToken = async () => {
        try {
          await refresh(persist);
          setTrueSuccess(true);
        } catch (e) {
          // refresh failed — handled by error state below
        }
      };
      //if (!token && isAuthenticated) {
      if (!token) {
        verifyRefreshToken();
      } else {
        setTrueSuccess(true);
      }
    }
    return () => (effectRan.current = true);
  }, []);

  /*
  useEffect(()=>{
    const lg = async()=>{
      await sendLogout();
    }
    if (!token && isError) lg()

    return () => {};
  }, [token, isError])
  

  
  useEffect(() => {
    if ((isSuccess && trueSuccess) || (token && isUninitialized)) {
      setIsReady(true);
    }
  }, [])*/

  let content;

  //console.log({ isLoading, isUninitialized, isSuccess, trueSuccess, isError, error, token});

  if (trueSuccess || (token && isUninitialized)) {
    content = <Outlet />;
  } else if (isLoading) {
    content = <Skeleton className='w-full h-[250px]' />;
  } else if (isError) {
    //expired tokens
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
