import { useState, useEffect } from 'react';

//used to send a flag to refresh endpoint / login to set long or
//short refresh Token life
const usePersist = () => {
  const [persist, setPersist] = useState(
    localStorage.getItem('persist') || `SHORT`
  );

  useEffect(() => {
    localStorage.setItem('persist', persist);
  }, [persist]);

  return [persist, setPersist];
};

export default usePersist;
