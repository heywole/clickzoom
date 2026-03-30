const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.name, '-', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFound };
