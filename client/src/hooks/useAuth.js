import { useSelector, useDispatch } from 'react-redux';
import { login, logout, register, fetchProfile } from '../store/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: (credentials) => dispatch(login(credentials)),
    logout: () => dispatch(logout()),
    register: (data) => dispatch(register(data)),
    fetchProfile: () => dispatch(fetchProfile()),
  };
};

export default useAuth;
