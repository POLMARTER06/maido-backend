import { db } from "../db/database.js";

export function getProducts(req, res) {
  const rows = db
    .prepare("SELECT * FROM products ORDER BY category ASC, name ASC")
    .all();
  res.json(rows);
}
