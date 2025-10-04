import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const token = useSelector(selectCurrentToken);

  const appRoles = [
    'Viewer',
    'Implementer',
    'CPIC Member',
    'CPIC Admin',
    'Admin',
  ];

  if (token) {
    const { roles, ...user } = jwtDecode(token);

    for (const role of appRoles) {
      const userKey = `is${role.replace(' ', '')}`;
      user[userKey] = role === 'Viewer' ? true : false;
      if (roles.includes(role)) {
        user[userKey] = true;
        user['status'] = role;
      }
    }

    return {
      ...user,
      roles,
    };
  }

  const unauthedUser = {
    id: null,
    email: null,
    roles: [],
    status: 'Viewer',
  };

  for (const role of appRoles) {
    const userKey = `is${role.replace(' ', '')}`;
    unauthedUser[userKey] = role === 'Viewer' ? true : false;
  }

  return unauthedUser;
};

export default useAuth;
