import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'Supplier ID is required' });

    const [rows]: any = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = {
      ...rows[0],
      type: 'supplier',
      productCategories: typeof rows[0].productCategories === 'string' ? JSON.parse(rows[0].productCategories) : rows[0].productCategories || []
    };

    return res.status(200).json({ success: true, supplier });
  } catch (err: any) {
    console.error('Error fetching supplier:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
