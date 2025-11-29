import { db } from "../db/database.js";

export function getTables(req, res) {
  const rows = db
    .prepare("SELECT * FROM restaurant_tables ORDER BY number ASC")
    .all();
  res.json(rows);
}

export function createTable(req, res) {
  const { number } = req.body;
  if (!number) {
    return res.status(400).json({ error: "number obligatoire" });
  }
  try {
    const result = db
      .prepare("INSERT INTO restaurant_tables (number, status) VALUES (?, 'libre')")
      .run(number);
    res.status(201).json({ id: result.lastInsertRowid, number });
  } catch (e) {
    res.status(400).json({ error: "Impossible de créer la table (doublon ?)" });
  }
}

export function updateTable(req, res) {
  const { id } = req.params;
  const { status, current_serveur_id } = req.body;

  const table = db
    .prepare("SELECT * FROM restaurant_tables WHERE id = ?")
    .get(id);
  if (!table) {
    return res.status(404).json({ error: "Table introuvable" });
  }

  db.prepare(`
    UPDATE restaurant_tables
    SET status = COALESCE(?, status),
        current_serveur_id = COALESCE(?, current_serveur_id)
    WHERE id = ?
  `).run(status ?? null, current_serveur_id ?? null, id);

  const updated = db
    .prepare("SELECT * FROM restaurant_tables WHERE id = ?")
    .get(id);

  res.json(updated);
}
