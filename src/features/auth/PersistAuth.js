import {
  Outlet,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useRefreshMutation, useSendLogoutMutation } from './authApiSlice';
import usePersist from '../../Hooks/usePersist';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from './authSlice';
import { Loading } from '../../components/Spinners';
import { Error } from '../../components/Generic';
import Cookies from 'js-cookie';

export const PersistAuth = () => {
  //const isAuthenticated = !!Cookies.get('cpic_isAuthenticated');
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
          //maybe add logout call
          console.log('persist component error', e);
        }
        setTrueSuccess(true);
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
    content = <Loading variant={2} size='lg' hasColors={true} />;
  } else if (isError) {
    //expired tokens
    console.log('tokens expired and user no longer authenticated');
    content = (
      <Navigate
        to='/login'
        replace={true}
        state={{ from: location.pathname }}
      />
    );
  }

  return content;
};
