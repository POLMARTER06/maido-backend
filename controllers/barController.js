import { db } from "../db/database.js";

export function getBarItems(req, res) {
  const items = db.prepare(`
    SELECT 
      oi.id AS item_id,
      oi.status,
      oi.quantity,
      oi.order_id,
      p.name,
      p.sub_category,
      t.number AS table_number
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    JOIN restaurant_tables t ON t.id = o.table_id
    WHERE oi.target = 'bar'
      AND oi.status != 'servi'
    ORDER BY o.created_at ASC, oi.id ASC
  `).all();

  res.json(items);
}
