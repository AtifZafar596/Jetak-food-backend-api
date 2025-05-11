const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../../../middleware/auth');
const { supabase } = require('../../../config/supabase');

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
 *     responses:
 *       200:
 *         description: Location saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/manual', authMiddleware, async (req, res) => {
  try {
    const { address } = req.body;
    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          user_id: req.user.id,
          address,
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
 *     summary: Save user's GPS location
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
 *                 description: User's address
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate
 *     responses:
 *       200:
 *         description: Location saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/gps', authMiddleware, async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;
    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          user_id: req.user.id,
          address,
          latitude,
          longitude,
          type: 'gps'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error saving GPS location:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/location/last:
 *   get:
 *     summary: Get user's last saved location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last saved location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No location found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/last', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'No location found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching last location:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 