const express = require('express');
const router = express.Router();
const { supabase } = require('../../../config/supabase');
const { adminAuthMiddleware } = require('../../../middleware/auth');

// GET /admin/api/users/:id
router.get('/users/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, full_name, email')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router; 