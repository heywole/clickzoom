import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toggleSidebar } from '../../store/uiSlice';
import useAuth from '../../hooks/useAuth';

const ClickZoomLogo = ({ small = false }) => (
  <div className="flex items-center gap-2">
    <div className="relative" style={{ width: small ? 28 : 36, height: small ? 28 : 36 }}>
      <div className="w-full h-full rounded-lg bg-electric-blue flex items-center justify-center">
        <svg width={small ? 16 : 20} height={small ? 16 : 20} viewBox="0 0 20 20" fill="none">
          <path d="M10 3L10 13M10 13L6 9M10 13L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-mint border-2 border-deep-dark flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-deep-dark" />
      </div>
    </div>
    {!small && (
      <div className="flex flex-col leading-none">
        <span className="text-lg">
          <span className="font-black text-electric-blue">Click</span>
          <span className="font-light text-electric-blue">Zoom</span>
        </span>
        <span className="text-[9px] tracking-widest mt-0.5">
          <span className="text-neon-mint font-bold">AUTOMATE</span>
          <span className="text-cz-gray font-normal"> YOUR CONTENT</span>
        </span>
      </div>
    )}
  </div>
);

const Navbar = ({ onMenuToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-deep-dark/90 backdrop-blur-md border-b border-dark-border h-16 flex items-center px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1">
        {isAuthenticated && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-lg text-cz-gray hover:text-white hover:bg-dark-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link to={isAuthenticated ? '/dashboard' : '/'}>
          <ClickZoomLogo />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/create" className="hidden md:flex items-center gap-2 bg-electric-blue hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Tutorial
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                <div className="px-4 py-2 border-b border-dark-border">
                  <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-cz-gray truncate">{user?.email}</p>
                </div>
                <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-cz-gray hover:text-white hover:bg-dark-hover transition-colors">
                  Settings
                </Link>
                <Link to="/pricing" className="flex items-center gap-2 px-4 py-2 text-sm text-cz-gray hover:text-white hover:bg-dark-hover transition-colors">
                  Upgrade Plan
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dark-hover transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-cz-gray hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link to="/register" className="bg-electric-blue hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export { ClickZoomLogo };
export default Navbar;
