const morgan = require('morgan');

// Custom token for request body
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('response-time', (req, res) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return ms.toFixed(2);
});

// Custom format
const logFormat = ':remote-addr - :method :url :status :response-time ms\nRequest Body: :body';

// Create logger middleware
const logger = morgan(logFormat, {
  skip: (req, res) => res.statusCode < 400, // Only log errors
  stream: {
    write: (message) => {
      console.log('\n📝 Request Log:', message.trim());
    }
  }
});

// Error logger middleware
const errorLogger = (err, req, res, next) => {
  console.error('\n❌ Error Log:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500
    },
    body: req.body,
    user: req.user ? req.user.id : 'unauthenticated'
  });
  next(err);
};

module.exports = { logger, errorLogger }; 