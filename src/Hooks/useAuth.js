import { useSelector } from 'react-redux';
import { selectMemoizedUser } from '../features/auth/authSlice';

const useAuth = () => {
  const user = useSelector(selectMemoizedUser);
  return user;
};

export default useAuth;
