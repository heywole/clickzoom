import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAuth from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-deep-dark">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      <main className={`pt-16 transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''}`}>
        <div className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
