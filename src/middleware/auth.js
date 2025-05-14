const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔒 Auth Middleware - Starting authentication check');
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ Auth Middleware - No authorization header found');
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('❌ Auth Middleware - No token found in authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('🔑 Auth Middleware - Verifying token with JWT_SECRET');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Auth Middleware - Token verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
      }
      console.log('✅ Auth Middleware - Authentication successful for user:', decoded.id);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('❌ Auth Middleware - Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the JWT token using your secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authMiddleware,
  adminAuthMiddleware
}; 