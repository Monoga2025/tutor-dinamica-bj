export default function handler(req, res) {
  res.status(200).json({ strokes: [], ts: Date.now() / 1000 });
}
