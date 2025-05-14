const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Production security configuration
const securityConfig = {
  // Helmet security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.supabase.co"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Logging configuration
  logging: {
    level: 'info',
    format: 'combined',
    options: {
      stream: {
        write: (message) => {
          // Implement your logging service here
          console.log(message.trim());
        },
      },
    },
  },

  // Error handling
  errorHandling: {
    showStack: false,
    showMessage: true,
    logErrors: true,
  },

  // Database configuration
  database: {
    poolSize: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },

  // Cache configuration
  cache: {
    ttl: 3600, // 1 hour
    checkPeriod: 600, // 10 minutes
  },
};

// Production middleware configuration
const middlewareConfig = {
  // Apply security middleware
  applySecurityMiddleware: (app) => {
    app.use(helmet(securityConfig.helmet));
    app.use(rateLimit(securityConfig.rateLimit));
  },

  // Apply logging middleware
  applyLoggingMiddleware: (app) => {
    const morgan = require('morgan');
    app.use(morgan(securityConfig.logging.format, securityConfig.logging.options));
  },

  // Apply error handling middleware
  applyErrorHandlingMiddleware: (app) => {
    app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = securityConfig.errorHandling.showMessage ? err.message : 'Internal Server Error';
      
      if (securityConfig.errorHandling.logErrors) {
        console.error('Error:', {
          message: err.message,
          stack: securityConfig.errorHandling.showStack ? err.stack : undefined,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(statusCode).json({
        error: message,
        status: statusCode,
      });
    });
  },
};

module.exports = {
  securityConfig,
  middlewareConfig,
}; 