import { VercelRequest, VercelResponse } from '@vercel/node';

let packingLists: any[] = [];

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
          const pl = packingLists.find(p => p.id === id);
          return res.status(pl ? 200 : 404).json(pl || { error: 'Not found' });
        }
        return res.status(200).json(packingLists);
      case 'POST':
        const data = req.body;
        if (!data.id) return res.status(400).json({ error: 'Missing ID' });
        const idx = packingLists.findIndex(p => p.id === data.id);
        if (idx >= 0) packingLists[idx] = { ...packingLists[idx], ...data, updatedAt: new Date().toISOString() };
        else packingLists.push({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        return res.status(200).json({ success: true, data });
      case 'DELETE':
        const { deleteId } = req.query;
        if (!deleteId) return res.status(400).json({ error: 'Missing ID' });
        packingLists = packingLists.filter(p => p.id !== deleteId);
        return res.status(200).json({ success: true });
      default:
        return res.status(405).end();
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
