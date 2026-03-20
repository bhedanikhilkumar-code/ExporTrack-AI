const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Basic auth health check
router.get('/status', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

// Get current user profile (Placeholder)
router.get('/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, region FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
