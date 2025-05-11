const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { supabase } = require('../../../config/supabase');
const { adminAuthMiddleware } = require('../../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Menus
 *   description: Admin menu management
 */

/**
 * @swagger
 * /admin/api/stores/{id}/menu:
 *   get:
 *     summary: Get all menu items for a store (admin)
 *     tags: [Admin Menus]
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
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized
 */
router.get('/stores/:id/menu', adminAuthMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /admin/api/stores/{id}/menu:
 *   post:
 *     summary: Create a new menu item for a store
 *     tags: [Admin Menus]
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
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/stores/:id/menu', adminAuthMiddleware, [
  body('name').notEmpty(),
  body('price').isNumeric(),
  body('description').optional().isString(),
  body('image_url').optional().isString()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url } = req.body;
    const { data, error } = await supabase
      .from('menu_items')
      .insert({ name, description, price, image_url, store_id: id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/menu/{menu_id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Admin Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menu_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item ID
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
 *               price:
 *                 type: number
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 */
router.put('/menu/:menu_id', adminAuthMiddleware, async (req, res) => {
  try {
    const { menu_id } = req.params;
    const { name, description, price, image_url } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = price;
    if (image_url !== undefined) updateFields.image_url = image_url;
    const { data, error } = await supabase
      .from('menu_items')
      .update(updateFields)
      .eq('id', menu_id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Menu item not found' });
    res.json(data);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/api/menu/{menu_id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Admin Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menu_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item ID
 *     responses:
 *       204:
 *         description: Menu item deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 */
router.delete('/menu/:menu_id', adminAuthMiddleware, async (req, res) => {
  try {
    const { menu_id } = req.params;
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menu_id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 