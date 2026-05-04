const sessions = globalThis.__tutorSyncSessions || new Map();
globalThis.__tutorSyncSessions = sessions;

export default function handler(req, res) {
  const session = String(req.query.session || '').trim();
  if (!session) return res.status(400).json({ error: 'session required' });

  if (req.method === 'GET') {
    return res.status(200).json(sessions.get(session) || { updatedAt: 0, payload: null });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const updatedAt = Number(body.updatedAt) || Date.now();
    sessions.set(session, { updatedAt, payload: body.payload || null });
    return res.status(200).json({ ok: true, updatedAt });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
