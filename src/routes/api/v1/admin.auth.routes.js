const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = [
  {
    email: 'admin@testing.com',
    password: 'admin',
    role: 'admin'
  },
  {
    email: 'admin123@testing.com',
    password: 'admin123',
    role: 'admin'
  }
];

// In-memory token blacklist (in production, use Redis or database)
const adminTokenBlacklist = new Set();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: 'Enter your JWT token in the format: Bearer <token>'
 *   schemas:
 *     AdminLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@testing.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "admin"
 *     AdminUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [admin]
 */

/**
 * @swagger
 * /admin/api/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin with email and password
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 */
router.post('/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 4 })
      .withMessage('Password must be at least 4 characters long')
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { email, password } = req.body;
      console.log('Login attempt for email:', email);

      // Find admin with matching credentials
      const admin = ADMIN_CREDENTIALS.find(
        admin => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
      );

      if (!admin) {
        console.log('Invalid credentials for email:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check if JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          email: admin.email,
          role: admin.role,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );

      console.log('Login successful for email:', email);

      res.json({
        success: true,
        token,
        user: {
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Error in admin login:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @swagger
 * /admin/api/auth/logout:
 *   post:
 *     summary: Admin logout
 *     description: Invalidate admin's JWT token
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Unauthorized
 */
router.post('/logout',
  authenticateAdminToken,
  async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      
      // Add token to blacklist
      adminTokenBlacklist.add(token);
      
      // Schedule token removal from blacklist after expiration
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;
        
        if (timeUntilExpiration > 0) {
          setTimeout(() => {
            adminTokenBlacklist.delete(token);
          }, timeUntilExpiration);
        }
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Error in admin logout:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /admin/api/auth/me:
 *   get:
 *     summary: Get admin profile
 *     description: Get current admin's profile information
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 */
router.get('/me',
  authenticateAdminToken,
  async (req, res) => {
    try {
      const admin = ADMIN_CREDENTIALS.find(
        admin => admin.email === req.user.email
      );

      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin not found'
        });
      }

      res.json({
        success: true,
        user: {
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /admin/api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin)
 *     description: Retrieve user details by user ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/users/:id', authenticateAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseAdmin } = require('../../../config/supabase');
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, phone, full_name, email')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Middleware to authenticate admin JWT token
function authenticateAdminToken(req, res, next) {
  // Commenting out admin token authentication for now
  next();
  /*
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Check if token is blacklisted
    if (adminTokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token has been invalidated'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            success: false,
            error: 'Token has expired'
          });
        }
        return res.status(403).json({
          success: false,
          error: 'Invalid token'
        });
      }

      // Verify that the token belongs to an admin
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateAdminToken:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
  */
}

module.exports = router; 