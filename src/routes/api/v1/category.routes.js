const express = require('express');
const router = express.Router();
const { supabase } = require('../../../config/supabase');
const { authenticateUser } = require('../../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Food category management
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all food categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of food categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a specific category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
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
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 