const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shipments ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single shipment
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
