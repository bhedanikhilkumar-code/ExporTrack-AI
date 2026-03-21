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
      taxId,
      paymentTerms,
      productCategories,
      notes,
      rating
    } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company Name is required' });
    }

    const id = `SUP-${Date.now()}`;
    const categoriesJson = productCategories ? JSON.stringify(productCategories) : '[]';

    // Ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(50) PRIMARY KEY,
        workspaceId VARCHAR(50) NOT NULL,
        companyName VARCHAR(255) NOT NULL,
        contactPerson VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        taxId VARCHAR(100),
        paymentTerms VARCHAR(100),
        productCategories JSON,
        notes TEXT,
        rating ENUM('A', 'B', 'C', 'D') DEFAULT 'C',
        totalOrders INT DEFAULT 0,
        totalValue DECIMAL(15,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(
      `INSERT INTO suppliers 
      (id, workspaceId, companyName, contactPerson, email, phone, address, city, country, taxId, paymentTerms, productCategories, notes, rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, workspaceId, companyName, contactPerson, email, phone, address, city, country, taxId, paymentTerms, categoriesJson, notes, rating || 'C']
    );

    return res.status(201).json({ success: true, id, message: 'Supplier created successfully' });
  } catch (err: any) {
    console.error('Error creating supplier:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
