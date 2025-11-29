import { db } from "../db/database.js";

export function getTVA(req, res) {
  const rows = db
    .prepare("SELECT * FROM tva_rates ORDER BY tva_type ASC")
    .all();
  res.json(rows);
}

export function updateTVA(req, res) {
  const { tva_type, rate } = req.body;
  if (!tva_type || typeof rate !== "number") {
    return res.status(400).json({ error: "tva_type et rate (number) requis" });
  }

  const existing = db
    .prepare("SELECT * FROM tva_rates WHERE tva_type = ?")
    .get(tva_type);

  if (existing) {
    db.prepare("UPDATE tva_rates SET rate = ? WHERE tva_type = ?")
      .run(rate, tva_type);
  } else {
    db.prepare("INSERT INTO tva_rates (tva_type, rate) VALUES (?, ?)")
      .run(tva_type, rate);
  }

  res.json({ success: true });
}
