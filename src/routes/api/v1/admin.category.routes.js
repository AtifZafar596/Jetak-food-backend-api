const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { supabase } = require('../../../config/supabase');
const { adminAuthMiddleware } = require('../../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Categories
 *   description: Admin category management
 */

/**
 * @swagger
 * /admin/api/categories:
 *   get:
 *     summary: Get all categories (admin)
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
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
 * /admin/api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/categories', adminAuthMiddleware, [
  body('name').notEmpty(),
  body('image_url').optional().isString()
], async (req, res) => {
  try {
    const { name, image_url } = req.body;
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, image_url, is_active: true })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url, is_active } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (image_url !== undefined) updateFields.image_url = image_url;
    if (is_active !== undefined) updateFields.is_active = is_active;
    const { data, error } = await supabase
      .from('categories')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 