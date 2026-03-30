import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import store from './store';
import App from './App';
import './styles/globals.css';

// Initialize Sentry error tracking (gracefully skipped if no DSN)
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0D1117', color: '#fff', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ color: '#1A73E8', fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ color: '#888780' }}>The error has been reported. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Refresh Page
          </button>
        </div>
      }
    >
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
