export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(401).json({ error: 'OPENROUTER_API_KEY no configurada en Vercel.' });

  try {
    const body = req.body || {};
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vercel.app',
        'X-Title': 'Tutor Dinamica BJ',
      },
      body: JSON.stringify({
        model: body.model || 'google/gemini-2.5-flash',
        max_tokens: body.max_tokens || 1024,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
        messages: body.messages || [],
      }),
    });

    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
}
