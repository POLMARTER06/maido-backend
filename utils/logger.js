import { db } from "../db/database.js";

export function addLog(type, message, meta = null) {
  db.prepare(`
    INSERT INTO logs (type, message, meta)
    VALUES (?, ?, ?)
  `).run(type, message, meta ? JSON.stringify(meta) : null);
}
