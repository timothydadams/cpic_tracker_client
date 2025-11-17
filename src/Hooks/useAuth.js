import React from 'react';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from '../features/auth/authSlice';

const useAuth = () => {
  const user = useSelector(selectMemoizedUser);

  /*
  const data = { ...user };

  const appRoles = [
    'Implementer',
    'CPIC Member',
    'CPIC Admin',
    'Admin',
  ];

  
  for (const role of appRoles) {
    const key = `is${role.replace(' ', '')}`;
    data[key] = data?.roles.includes(role) ? true : false;
    if (data[key] == true) {
      data.status = role;
    }
  }
  */

  //const memoized = React.useMemo(() => data);

  //console.log('user details in useAuth() component:', data);

  return user;
};

export default useAuth;
