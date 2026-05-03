export default function handler(req, res) {
  const now = Date.now() / 1000;
  res.status(200).json(['14.1', '14.2', '14.5', '14.7'].map((ex_id, i) => ({
    ex_id,
    ts: now - (4 - i) * 60,
    hints_used: 0,
    success: 1,
  })));
}
