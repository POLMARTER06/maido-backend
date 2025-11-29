import { db } from "../db/database.js";

export function getUsers(req, res) {
  const rows = db
    .prepare("SELECT * FROM users ORDER BY name ASC")
    .all();
  res.json(rows);
}

export function createUser(req, res) {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "name et role sont obligatoires" });
  }
  const result = db
    .prepare("INSERT INTO users (name, role, active) VALUES (?, ?, 1)")
    .run(name, role);
  res.status(201).json({ id: result.lastInsertRowid, name, role });
}
