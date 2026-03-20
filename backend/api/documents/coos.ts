import { VercelRequest, VercelResponse } from '@vercel/node';

let coos: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();

  try {
    switch (method) {
      case 'GET':
        const { id } = req.query;
        if (id) {
          const coo = coos.find(c => c.id === id);
          return res.status(coo ? 200 : 404).json(coo || { error: 'Not found' });
        }
        return res.status(200).json(coos);
      case 'POST':
        const data = req.body;
        if (!data.id) return res.status(400).json({ error: 'Missing ID' });
        const idx = coos.findIndex(c => c.id === data.id);
        if (idx >= 0) coos[idx] = { ...coos[idx], ...data, updatedAt: new Date().toISOString() };
        else coos.push({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        return res.status(200).json({ success: true, data });
      case 'DELETE':
        const { deleteId } = req.query;
        if (!deleteId) return res.status(400).json({ error: 'Missing ID' });
        coos = coos.filter(c => c.id !== deleteId);
        return res.status(200).json({ success: true });
      default:
        return res.status(405).end();
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
