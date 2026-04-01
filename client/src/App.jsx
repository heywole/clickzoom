import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useAuth from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Toast from './components/common/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTutorial from './pages/CreateTutorial';
import TutorialDetail from './pages/TutorialDetail';
import TutorialsList from './pages/TutorialsList';
import GeneratedContent from './pages/GeneratedContent';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import WalletPage from './pages/WalletPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <>
      <Toast />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tutorials" element={<PrivateRoute><TutorialsList /></PrivateRoute>} />
          <Route path="/tutorials/:id" element={<PrivateRoute><TutorialDetail /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateTutorial /></PrivateRoute>} />
          <Route path="/content/:tutorialId" element={<PrivateRoute><GeneratedContent /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><WalletPage /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
};

export default App;
