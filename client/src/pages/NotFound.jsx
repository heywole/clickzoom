import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
    <div className="text-8xl font-black text-electric-blue/20 mb-4">404</div>
    <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
    <p className="text-cz-gray mb-8 max-w-md">The page you are looking for does not exist or has been moved.</p>
    <Link to="/dashboard" className="bg-electric-blue hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
