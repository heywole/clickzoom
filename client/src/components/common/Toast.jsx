import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: { background: '#161B22', color: '#fff', border: '1px solid #21262D', borderRadius: '12px', fontSize: '14px' },
      success: { iconTheme: { primary: '#00E5A0', secondary: '#161B22' } },
      error: { iconTheme: { primary: '#ef4444', secondary: '#161B22' } },
    }}
  />
);

export default Toast;
