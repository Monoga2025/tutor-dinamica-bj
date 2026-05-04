const sessions = globalThis.__tutorSyncSessions || new Map();
globalThis.__tutorSyncSessions = sessions;

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvGet(key) {
  if(!kvUrl || !kvToken) return null;
  const r = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken}` }
  });
  if(!r.ok) throw new Error(`KV GET ${r.status}`);
  const data = await r.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(key, value) {
  if(!kvUrl || !kvToken) return false;
  const r = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value))
  });
  if(!r.ok) throw new Error(`KV SET ${r.status}`);
  return true;
}

export default async function handler(req, res) {
  const session = String(req.query.session || '').trim();
  if (!session) return res.status(400).json({ error: 'session required' });
  const key = `tutor-sync:${session}`;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const stored = await kvGet(key);
      const value = stored || sessions.get(session) || { updatedAt: 0, payload: null };
      return res.status(200).json({ ...value, durable: Boolean(stored && kvUrl && kvToken) });
    } catch(e) {
      return res.status(200).json(sessions.get(session) || { updatedAt: 0, payload: null, warning: e.message });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const updatedAt = Number(body.updatedAt) || Date.now();
    const value = { updatedAt, payload: body.payload || null };
    sessions.set(session, value);
    try { await kvSet(key, value); }
    catch(e) { return res.status(200).json({ ok: true, updatedAt, warning: e.message, durable: false }); }
    return res.status(200).json({ ok: true, updatedAt, durable: Boolean(kvUrl && kvToken) });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
