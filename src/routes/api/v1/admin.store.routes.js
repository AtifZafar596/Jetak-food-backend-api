const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { supabase } = require('../../../config/supabase');
const { adminAuthMiddleware } = require('../../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Stores
 *   description: Admin store management
 */

/**
 * @swagger
 * /admin/api/stores:
 *   get:
 *     summary: Get all stores (admin)
 *     tags: [Admin Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       401:
 *         description: Unauthorized
 */
router.get('/stores', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/stores:
 *   post:
 *     summary: Create a new store
 *     tags: [Admin Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Store created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/stores', adminAuthMiddleware, [
  body('name').notEmpty(),
  body('category_id').notEmpty(),
  body('description').optional().isString(),
  body('image_url').optional().isString()
], async (req, res) => {
  try {
    const { name, description, image_url, category_id } = req.body;
    const { data, error } = await supabase
      .from('stores')
      .insert({ name, description, image_url, category_id })
      .select()
      .single();
    if (error) throw error;
    console.log('Store created:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/stores/{id}:
 *   put:
 *     summary: Update a store
 *     tags: [Admin Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Store updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Store not found
 */
router.put('/stores/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, category_id } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (image_url !== undefined) updateFields.image_url = image_url;
    if (category_id !== undefined) updateFields.category_id = category_id;
    const { data, error } = await supabase
      .from('stores')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Store not found' });
    res.json(data);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/stores/{id}:
 *   delete:
 *     summary: Delete a store
 *     tags: [Admin Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     responses:
 *       204:
 *         description: Store deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Store not found
 */
router.delete('/stores/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 