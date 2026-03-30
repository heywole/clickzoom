import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-dark-border py-8 px-6 mt-auto">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-cz-gray text-sm">© 2026 ClickZoom. All rights reserved.</p>
      <div className="flex gap-6">
        <Link to="/pricing" className="text-sm text-cz-gray hover:text-white transition-colors">Pricing</Link>
        <a href="#" className="text-sm text-cz-gray hover:text-white transition-colors">Privacy</a>
        <a href="#" className="text-sm text-cz-gray hover:text-white transition-colors">Terms</a>
      </div>
    </div>
  </footer>
);

export default Footer;
