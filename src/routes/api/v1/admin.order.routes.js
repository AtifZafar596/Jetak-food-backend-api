const express = require('express');
const router = express.Router();
const { supabase } = require('../../../config/supabase');
const { adminAuthMiddleware } = require('../../../middleware/auth');

/**
 * @swagger
 * /admin/api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve all orders with pagination and filtering options
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, delivered, cancelled]
 *         description: Filter orders by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query with user details
    let query = supabase
      .from('orders')
      .select('*, stores(name), users(id, full_name, phone)', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Get paginated results
    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /admin/api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve detailed information about a specific order
 *     tags: [Admin Orders]
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
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/orders/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, stores(name), users(phone)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /admin/api/analytics/orders:
 *   get:
 *     summary: Get order analytics
 *     description: Retrieve order statistics and analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         required: true
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
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
 *                     total_orders:
 *                       type: integer
 *                     total_revenue:
 *                       type: number
 *                     average_order_value:
 *                       type: number
 *                     status_breakdown:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         confirmed:
 *                           type: integer
 *                         preparing:
 *                           type: integer
 *                         ready:
 *                           type: integer
 *                         delivered:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const { range = 'today' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid range parameter'
        });
    }

    // Get orders within date range
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Calculate analytics
    const analytics = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      average_order_value: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length 
        : 0,
      status_breakdown: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.put('/orders/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /admin/api/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     description: Retrieve user information by their ID
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
 *                     full_name:
 *                       type: string
 *                     phone:
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
router.get('/users/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, phone, email')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      throw error;
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

module.exports = router; 