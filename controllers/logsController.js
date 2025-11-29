import { db } from "../db/database.js";

export function getLogs(req, res) {
  const limit = Number(req.query.limit || 200);
  const { type } = req.query;

  let rows;
  if (type) {
    rows = db.prepare(`
      SELECT * FROM logs
      WHERE type = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `).all(type, limit);
  } else {
    rows = db.prepare(`
      SELECT * FROM logs
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `).all(limit);
  }

  res.json(rows);
}
