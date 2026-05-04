import solutions from '../solutions-data.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  const id = String(req.query.id || '').trim();
  if(id) {
    const solution = solutions[id] || null;
    return res.status(200).json({ id, found: Boolean(solution), solution });
  }

  return res.status(200).json({
    count: Object.keys(solutions).length,
    missing: ['14.2', '14.14'],
    ids: Object.keys(solutions).sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]))
  });
}
