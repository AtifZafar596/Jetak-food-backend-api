const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../../../middleware/auth');
const { supabase } = require('../../../config/supabase');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - items
 *               - delivery_address
 *             properties:
 *               store_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the store
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - menu_item_id
 *                     - quantity
 *                   properties:
 *                     menu_item_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               delivery_address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
router.post('/',
  authMiddleware,
  [
    body('store_id').isUUID(),
    body('items').isArray().notEmpty(),
    body('items.*.menu_item_id').isUUID(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('delivery_address').notEmpty(),
    body('delivery_latitude').optional().isFloat({ min: -90, max: 90 }),
    body('delivery_longitude').optional().isFloat({ min: -180, max: 180 }),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const {
        store_id,
        items,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        notes
      } = req.body;

      // Calculate total amount
      let total_amount = 0;
      for (const item of items) {
        const { data: menuItem, error: menuError } = await supabase
          .from('menu_items')
          .select('price')
          .eq('id', item.menu_item_id)
          .single();

        if (menuError) throw menuError;
        total_amount += menuItem.price * item.quantity;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: req.user.id,
          store_id,
          total_amount,
          delivery_address,
          delivery_latitude,
          delivery_longitude,
          notes,
          status: 'pending'
        })
        .select()
        .single();

      console.log('Order insert result:', order, orderError);

      if (orderError) throw orderError;
      if (!order || !order.id) {
        console.error('Order insert did not return an order object:', order);
        return res.status(500).json({ error: 'Order insert did not return an order object.' });
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      console.log('Order items insert error:', itemsError);

      if (itemsError) throw itemsError;

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
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
router.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      console.log('📦 Orders - Fetching orders for user:', req.user.id);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores(name, logo_url),
          order_items(
            quantity,
            price,
            menu_items(name, image_url)
          )
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Orders - Error fetching orders:', error);
        throw error;
      }

      console.log('✅ Orders - Successfully fetched orders:', data?.length || 0);
      res.json(data);
    } catch (error) {
      console.error('❌ Orders - Error in GET /orders:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
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
router.get('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores(name, logo_url),
          order_items(
            quantity,
            price,
            menu_items(name, image_url)
          )
        `)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
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
router.put('/:id/cancel',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if order exists and belongs to user
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

      if (orderError) throw orderError;
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({ error: 'Order cannot be cancelled' });
      }

      // Update order status
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router; 