export default function handler(req, res) {
  res.status(200).json({ rating: 1500, streak: 4, total_att: 4, total_wins: 4 });
}
