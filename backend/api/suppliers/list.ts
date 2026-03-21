import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const workspaceId = req.query.workspaceId || 'default';

    // We do a check so it doesn't fail if table doesn't exist yet
    const [tables]: any = await pool.query("SHOW TABLES LIKE 'suppliers'");
    if (tables.length === 0) {
      return res.status(200).json({ success: true, suppliers: [] });
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM suppliers WHERE workspaceId = ? ORDER BY companyName ASC',
      [workspaceId]
    );

    // Parse productCategories JSON
    const suppliers = rows.map((row: any) => ({
      ...row,
      type: 'supplier',
      productCategories: typeof row.productCategories === 'string' ? JSON.parse(row.productCategories) : row.productCategories || []
    }));

    return res.status(200).json({ success: true, suppliers });
  } catch (err: any) {
    console.error('Error fetching suppliers:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
