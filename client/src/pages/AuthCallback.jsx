import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { setAccessToken } from '../utils/api';
import { userService } from '../services/apiService';
import Loader from '../components/common/Loader';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login?error=auth_failed');
      return;
    }

    setAccessToken(token);

    userService.getProfile()
      .then(({ data }) => {
        dispatch(setUser(data.user));
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login?error=auth_failed');
      });
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-deep-dark flex items-center justify-center">
      <Loader text="Completing sign in..." />
    </div>
  );
};

export default AuthCallback;
