export default function handler(req, res) {
  res.status(200).json({ or_model: 'google/gemini-2.5-flash' });
}
