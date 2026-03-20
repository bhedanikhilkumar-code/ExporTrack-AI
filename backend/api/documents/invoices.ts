import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // Simple CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        const { id, orgId } = req.query;
        if (id) {
          const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
          if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
          return res.status(200).json(rows[0]);
        }
        
        if (orgId) {
          const [rows]: any = await pool.query('SELECT * FROM invoices WHERE orgId = ?', [orgId]);
          return res.status(200).json(rows);
        }

        const [allInvoices]: any = await pool.query('SELECT * FROM invoices');
        return res.status(200).json(allInvoices);

      case 'POST':
        const data = req.body;
        if (!data.id) return res.status(400).json({ error: 'Missing ID' });
        
        // Prepare data for SQL - convert complex objects to JSON strings if needed
        const sqlData = { ...data };
        if (sqlData.items && typeof sqlData.items !== 'string') sqlData.items = JSON.stringify(sqlData.items);
        if (sqlData.bankDetails && typeof sqlData.bankDetails !== 'string') sqlData.bankDetails = JSON.stringify(sqlData.bankDetails);

        // Check if exists
        const [existing]: any = await pool.query('SELECT id FROM invoices WHERE id = ?', [data.id]);
        
        if (existing.length > 0) {
          await pool.query('UPDATE invoices SET ? WHERE id = ?', [sqlData, data.id]);
        } else {
          await pool.query('INSERT INTO invoices SET ?', [sqlData]);
        }
        
        return res.status(200).json({ success: true, data: data });

      case 'DELETE':
        const { deleteId } = req.query;
        if (!deleteId) return res.status(400).json({ error: 'Missing document ID' });
        
        await pool.query('DELETE FROM invoices WHERE id = ?', [deleteId]);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
