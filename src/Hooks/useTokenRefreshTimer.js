import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { selectCurrentToken } from '../features/auth/authSlice';
import { useRefreshMutation } from '../features/auth/authApiSlice';

const REFRESH_BUFFER_MS = 60 * 1000; // refresh 60s before expiry

const useTokenRefreshTimer = (persist = 'SHORT') => {
  const token = useSelector(selectCurrentToken);
  const [refresh] = useRefreshMutation();
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!token) return;

    let exp;
    try {
      const decoded = jwtDecode(token);
      exp = decoded.exp;
    } catch {
      return;
    }

    const expiresInMs = exp * 1000 - Date.now();
    const refreshInMs = expiresInMs - REFRESH_BUFFER_MS;

    if (refreshInMs <= 0) {
      // Token already expired or within buffer — refresh immediately
      refresh(persist);
      return;
    }

    timerRef.current = setTimeout(() => {
      refresh(persist);
    }, refreshInMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [token, persist, refresh]);
};

export default useTokenRefreshTimer;
