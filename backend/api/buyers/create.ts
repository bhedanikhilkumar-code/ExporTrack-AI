import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      workspaceId = 'default',
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      currency,
      paymentTerms,
      creditLimit,
      notes,
      tags
    } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company Name is required' });
    }

    const id = `BUY-${Date.now()}`;
    const tagsJson = tags ? JSON.stringify(tags) : '[]';

    // Ensure the table exists (in a real app, do this in migrations)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buyers (
        id VARCHAR(50) PRIMARY KEY,
        workspaceId VARCHAR(50) NOT NULL,
        companyName VARCHAR(255) NOT NULL,
        contactPerson VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        currency VARCHAR(10),
        paymentTerms VARCHAR(100),
        creditLimit DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        tags JSON,
        totalOrders INT DEFAULT 0,
        totalValue DECIMAL(15,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(
      `INSERT INTO buyers 
      (id, workspaceId, companyName, contactPerson, email, phone, address, city, country, currency, paymentTerms, creditLimit, notes, tags) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, workspaceId, companyName, contactPerson, email, phone, address, city, country, currency, paymentTerms, creditLimit || 0, notes, tagsJson]
    );

    return res.status(201).json({ success: true, id, message: 'Buyer created successfully' });
  } catch (err: any) {
    console.error('Error creating buyer:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
