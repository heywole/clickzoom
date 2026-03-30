import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearRegistrationSuccess } from '../store/authSlice';
import useToast from '../hooks/useToast';
import { ClickZoomLogo } from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error, registrationSuccess, isAuthenticated } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (error) toast.error(error); }, [error]);
  useEffect(() => {
    if (registrationSuccess) {
      toast.success('Account created! Please check your email to verify your account before signing in.');
      dispatch(clearRegistrationSuccess());
      navigate('/login');
    }
  }, [registrationSuccess]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSignup = () => {
    window.location.href = `https://clickzoom-production.up.railway.app/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.password !== form.confirmPassword) return setFormError('Passwords do not match');
    if (form.password.length < 8) return setFormError('Password must be at least 8 characters');
    dispatch(register({
      email: form.email,
      password: form.password,
      firstName: form.email.split('@')[0],
      lastName: '',
    }));
  };

  return (
    <div className="min-h-screen bg-deep-dark flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><ClickZoomLogo /></div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-cz-gray mt-2 text-sm">Start automating your content for free</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">

          {/* Google signup button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-xs text-cz-gray">or sign up with email</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />
            {formError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            <Button type="submit" loading={loading} fullWidth>
              Create Free Account
            </Button>
          </form>

          {/* Email verification notice */}
          <div className="mt-5 p-4 bg-electric-blue/5 border border-electric-blue/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-electric-blue text-lg flex-shrink-0">📧</span>
              <div>
                <p className="text-white text-sm font-semibold">Check your email after signing up</p>
                <p className="text-cz-gray text-xs mt-1">We will send you a confirmation link. Click it to activate your account before signing in.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-cz-gray text-center mt-5">
            By creating an account you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <p className="text-center text-sm text-cz-gray mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-electric-blue hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
