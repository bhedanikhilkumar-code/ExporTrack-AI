import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Ensure table exists safely
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        referenceNo VARCHAR(100) NOT NULL,
        buyerId VARCHAR(50) NOT NULL,
        invoiceId VARCHAR(50),
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        date VARCHAR(20) NOT NULL,
        method VARCHAR(50),
        status VARCHAR(20),
        notes TEXT,
        createdAt VARCHAR(30)
      )
    `;
    await pool.query(createTableQuery);

    const query = `SELECT * FROM payments ORDER BY createdAt DESC`;
    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
