const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../../../config/supabase');
const TwilioService = require('../../../services/twilio.service');
const OTPModel = require('../../../models/otp.model');

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// In-memory token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

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
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         phone:
 *           type: string
 *           example: "+923216610180"
 *         full_name:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         avatar_url:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Invalid OTP"
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "OTP sent successfully"
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user's phone number
 *     description: Generates and sends a 6-digit OTP to the provided phone number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number in international format
 *                 example: "+923216610180"
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "OTP sent successfully"
 *       400:
 *         description: Invalid phone number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/send-otp',
  body('phone').isMobilePhone(),
  async (req, res) => {
    try {
      const { phone } = req.body;
      
      // Commented out OTP generation, storage, and sending
      // const otp = TwilioService.generateOTP();
      // await OTPModel.storeOTP(phone, otp);
      // await TwilioService.sendOTP(phone, otp);
      
      res.json({ 
        success: true,
        message: 'OTP sent successfully (mocked)',
        // otp: otp
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and generate JWT token
 *     description: |
 *       Verifies the OTP and returns a JWT token for authentication.
 *       The token is valid for 7 days and should be included in the Authorization header for protected routes.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number in international format
 *                 example: "+923216610180"
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP received via SMS
 *                 example: "991702"
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
 *                   description: JWT token for authentication (valid for 7 days)
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 redirectTo:
 *                   type: string
 *                   description: Redirect URL after successful login
 *                   example: "/home"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid OTP or phone number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-otp',
  // Removing validators
  // body('phone').isMobilePhone(),
  // body('otp').isLength({ min: 6, max: 6 }),
  async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      // Skip OTP validation for now
      // const isValid = await OTPModel.verifyOTP(phone, otp);
      // if (!isValid) {
      //   return res.status(400).json({ 
      //     success: false,
      //     error: 'Invalid or expired OTP' 
      //   });
      // }

      try {
        // Get or create user
        let user = await getUserByPhone(phone);
        if (!user) {
          user = await createUser(phone);
        }

        //Auth token commented
        // const token = generateToken(user);
        // console.log("Verified OTP and generated token:");
        
        // Skip token generation for now
        // const token = generateToken(user);
        console.log("OTP verification skipped - proceeding to home");

        // Then send the response with 200 status
        return res.status(200).json({
          success: true,
          //token,
          navigationPath: '/',
          // Auth token commented
          user: {
            id: user.id,
            phone: user.phone,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url
          }
        });
      } catch (userError) {
        console.error('Error handling user:', userError);
        return res.status(400).json({
          success: false,
          error: 'Failed to process user account'
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: |
 *       Invalidates the current user's session by blacklisting the JWT token.
 *       The token will no longer be valid for any authenticated requests.
 *       
 *       **Authentication Required:**
 *       - Include the JWT token in the Authorization header
 *       - Format: `Authorization: Bearer <your_jwt_token>`
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT token in the format 'Bearer <token>'
 *         example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      
      // Add token to blacklist
      tokenBlacklist.add(token);
      
      // Schedule token removal from blacklist after expiration
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;
        
        if (timeUntilExpiration > 0) {
          setTimeout(() => {
            tokenBlacklist.delete(token);
          }, timeUntilExpiration);
        }
      }

      res.json({ 
        success: true,
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: |
 *       Retrieves the profile of the currently authenticated user.
 *       
 *       **Authentication Required:**
 *       - Include the JWT token in the Authorization header
 *       - Format: `Authorization: Bearer <your_jwt_token>`
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT token in the format 'Bearer <token>'
 *         example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Token expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Generates a new JWT token for the authenticated user.
 *       
 *       **Authentication Required:**
 *       - Include the JWT token in the Authorization header
 *       - Format: `Authorization: Bearer <your_jwt_token>`
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT token in the format 'Bearer <token>'
 *         example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   description: New JWT token
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Token expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh',
  authenticateToken,
  async (req, res) => {
    try {
      // Get user data
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;

      // Generate new token
      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url
        }
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

// Helper functions
async function getUserByPhone(phone) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createUser(phone) {
  try {
    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If user exists, return the existing user
    if (existingUser) {
      return existingUser;
    }

    // If user doesn't exist, create new user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          phone,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      throw new Error('Failed to create user');
    }

    return newUser;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { 
      id: user.id,
      phone: user.phone,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // Expires in 7 days
    },
    process.env.JWT_SECRET,
    {   
      algorithm: 'HS256'
    }
  );
}

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  // Commenting out authentication for now
  //auth token commented
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
    if (tokenBlacklist.has(token)) {
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
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
  */
}

module.exports = router; 