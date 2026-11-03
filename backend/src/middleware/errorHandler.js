const { failure } = require('../utils/response');

function notFoundHandler(req, res, next) {
  return failure(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';

  return failure(res, code, message, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
