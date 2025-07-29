const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const error = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
  require('../utils/logger').error(err.stack);
  res.status(status).json({ success: false, error });
};

module.exports = errorHandler;