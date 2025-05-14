const express = require('express');
const router = express.Router();
const { supabase } = require('../../../config/supabase');
const LoggingService = require('../../../services/logging.service');
const { authMiddleware } = require('../../../middleware/auth');

// Add logging middleware
const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📝 Request Log: ${req.ip} - ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    if (req.body) {
      console.log('Request Body:', JSON.stringify(req.body));
    }
  });
  next();
};

router.use(logRequest);

// Protect all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: User location management
 */

/**
 * @swagger
 * /api/location/manual:
 *   post:
 *     summary: Save user's manual address
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: User's address
 *               additional_note:
 *                 type: string
 *                 description: Additional details about the location
 *     responses:
 *       200:
 *         description: Location saved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/manual', async (req, res) => {
  try {
    const { address, additional_note } = req.body;
    const user_id = req.user.id;
    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          user_id,
          address,
          additional_note,
          type: 'manual'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error saving manual location:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/location/gps:
 *   post:
 *     summary: Save a GPS location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - latitude
 *               - longitude
 *             properties:
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               additional_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/gps', async (req, res) => {
  const { address, latitude, longitude, additional_note } = req.body;
  const user_id = req.user.id;
  
  // Input validation
  if (!user_id || !address || latitude === undefined || longitude === undefined) {
    LoggingService.error('Invalid input parameters', {
      user_id,
      address,
      latitude,
      longitude,
    });
    return res.status(400).json({
      error: 'Invalid input',
      details: 'Missing required parameters',
      code: 'INVALID_INPUT',
      hint: 'Please provide all required fields: address, latitude, longitude',
    });
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    LoggingService.error('Invalid coordinates', { latitude, longitude });
    return res.status(400).json({
      error: 'Invalid coordinates',
      details: 'Latitude must be between -90 and 90, longitude between -180 and 180',
      code: 'INVALID_COORDINATES',
      hint: 'Please provide valid coordinates',
    });
  }

  try {
    LoggingService.info('Attempting to save location', {
      user_id,
      address,
      latitude,
      longitude,
    });

    // Prepare location data
    const locationData = {
      user_id,
      address,
      latitude,
      longitude,
      additional_note: additional_note || null,
      is_default: false,
      updated_at: new Date(),
    };

    // Insert into database
    const { data, error } = await supabase
      .from('user_locations')
      .insert([locationData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to save location',
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }

    LoggingService.info('Location saved successfully', {
      locationId: data.id,
      user_id,
    });

    res.json(data);
  } catch (error) {
    LoggingService.error('Error saving location', error);
    res.status(500).json({
      error: 'Failed to save location',
      details: error.message,
      code: 'DB_ERROR',
      hint: 'Please try again later',
    });
  }
});

/**
 * @swagger
 * /api/location/last:
 *   get:
 *     summary: Get the last saved location for a user
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last location retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No location found
 *       500:
 *         description: Server error
 */
router.get('/last', async (req, res) => {
  const user_id = req.user.id;

  try {
    LoggingService.info('Fetching last location', { user_id });

    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        LoggingService.info('No location found for user', { user_id });
        return res.status(200).json({
          address: 'No address available.',
          latitude: 0,
          longitude: 0,
          additional_note: null,
          is_default: false,
          updated_at: new Date().toISOString()
      });
      }
      LoggingService.error('Error fetching last location', error);
      throw error;
    }

    LoggingService.info('Last location retrieved successfully', {
      locationId: data.id,
      user_id,
    });

    res.json(data);
  } catch (error) {
    LoggingService.error('Error fetching last location', error);
    res.status(500).json({
      error: 'Failed to fetch last location',
      details: error.message,
      code: 'DB_ERROR',
      hint: 'Please try again later',
    });
  }
});

/**
 * @swagger
 * /api/location/update:
 *   put:
 *     summary: Update user's last location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - latitude
 *               - longitude
 *             properties:
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               additional_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update', async (req, res) => {
  const user_id = req.user.id;
  const { address, latitude, longitude, additional_note } = req.body;

  LoggingService.info('Update location request received', {
    user_id,
    address,
    latitude,
    longitude,
    additional_note
  });

  // Input validation
  if (!address || latitude === undefined || longitude === undefined) {
    LoggingService.error('Invalid input parameters', {
      user_id,
      address,
      latitude,
      longitude,
    });
    return res.status(400).json({
      error: 'Invalid input',
      details: 'Missing required parameters',
      code: 'INVALID_INPUT',
      hint: 'Please provide all required fields: address, latitude, longitude',
    });
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    LoggingService.error('Invalid coordinates', { latitude, longitude });
    return res.status(400).json({
      error: 'Invalid coordinates',
      details: 'Latitude must be between -90 and 90, longitude between -180 and 180',
      code: 'INVALID_COORDINATES',
      hint: 'Please provide valid coordinates',
    });
  }

  try {
    LoggingService.info('Attempting to update location', {
      user_id,
      address,
      latitude,
      longitude,
    });

    // First, try to find any existing location for the user
    const { data: existingLocations, error: fetchError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      LoggingService.error('Error fetching existing locations', fetchError);
      throw fetchError;
    }

    let result;
    if (!existingLocations || existingLocations.length === 0) {
      // If no location exists, insert a new one
      LoggingService.info('No existing location found, creating new one');
      const { data, error } = await supabase
        .from('user_locations')
        .insert([{
          user_id,
          address,
          latitude,
          longitude,
          additional_note: additional_note || null,
          is_default: false,
          updated_at: new Date(),
        }])
        .select()
        .single();
      
      if (error) {
        LoggingService.error('Error inserting new location', error);
        throw error;
      }
      result = data;
    } else {
      // Update the latest location
      LoggingService.info('Updating existing location', { locationId: existingLocations[0].id });
      const { data, error } = await supabase
        .from('user_locations')
        .update({
          address,
          latitude,
          longitude,
          additional_note: additional_note || null,
          updated_at: new Date(),
        })
        .eq('id', existingLocations[0].id)
        .select()
        .single();
      
      if (error) {
        LoggingService.error('Error updating location', error);
        throw error;
      }
      result = data;
    }

    LoggingService.info('Location updated successfully', {
      locationId: result.id,
      user_id,
    });

    res.json(result);
  } catch (error) {
    LoggingService.error('Error updating location', error);
    res.status(500).json({
      error: 'Failed to update location',
      details: error.message,
      code: 'DB_ERROR',
      hint: 'Please try again later',
    });
  }
});

module.exports = router;