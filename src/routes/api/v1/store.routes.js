const express = require('express');
const router = express.Router();
const { supabase } = require('../../../config/supabase');
const { authenticateUser } = require('../../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Food store management
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores or filter by category or search
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter stores by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search stores by name
 *     responses:
 *       200:
 *         description: List of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = supabase.from('stores').select('*');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Get a specific store by ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       404:
 *         description: Store not found
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/stores/{id}/menu:
 *   get:
 *     summary: Get store's menu items
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Store not found
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
router.get('/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('store_id', id)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 