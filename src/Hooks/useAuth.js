import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

const useAuth = () => {
  const user = useSelector(selectUser);

  const data = { ...user };

  const appRoles = [
    'Viewer',
    'Implementer',
    'CPIC Member',
    'CPIC Admin',
    'Admin',
  ];

  for (const role of appRoles) {
    const key = `is${role.replace(' ', '')}`;
    data[key] = data.roles.includes(role) ? true : false;
    if (data[key] == true) {
      data.status = role;
    }
  }

  console.log('user details in useAuth() component:', data);

  return data;
};

export default useAuth;
