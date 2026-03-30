const Sentry = require('@sentry/node');

const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    console.log('[Sentry] No DSN configured — error tracking disabled');
    return;
  }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ tracing: true }),
      new Sentry.Integrations.Mongo({ useMongoose: true }),
    ],
  });
  console.log('[Sentry] Error tracking initialized');
};

const sentryRequestHandler = () => {
  if (!process.env.SENTRY_DSN) return (req, res, next) => next();
  return Sentry.Handlers.requestHandler();
};

const sentryErrorHandler = () => {
  if (!process.env.SENTRY_DSN) return (err, req, res, next) => next(err);
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 4xx and 5xx errors
      if (error.status >= 400) return true;
      return true;
    },
  });
};

const captureException = (err, context = {}) => {
  if (!process.env.SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
    Sentry.captureException(err);
  });
};

const captureMessage = (message, level = 'info', context = {}) => {
  if (!process.env.SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
    Sentry.captureMessage(message, level);
  });
};

module.exports = { initSentry, sentryRequestHandler, sentryErrorHandler, captureException, captureMessage };
