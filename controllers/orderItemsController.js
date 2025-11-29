import { db } from "../db/database.js";
import { getIO } from "../socket.js";
import { computeTotals } from "../utils/totals.js";
import { addLog } from "../utils/logger.js";

export function addItemsToOrder(req, res) {
  const { id } = req.params;
  const { items } = req.body;

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items doit être un tableau non vide" });
  }

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents, target)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const it of items) {
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(it.productId);
    if (!product) continue;
    insertItem.run(order.id, it.productId, it.quantity || 1, product.price_cents, product.target);
  }

  const totals = computeTotals(order.id);
  db.prepare(`
    UPDATE orders SET 
      total_ht_cents = ?, 
      total_tva_cents = ?, 
      total_ttc_cents = ?
    WHERE id = ?
  `).run(totals.ht, totals.tva, totals.ttc, order.id);

  const io = getIO();
  io.emit("order:itemsAdded", {
    orderId: order.id,
    tableId: order.table_id,
    totals
  });

  addLog(
    "order_items_added",
    `Items ajoutés à la commande #${order.id}`,
    { orderId: order.id, items, totals }
  );

  res.json({ success: true, totals });
}

export function updateItemStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["en_attente", "en_preparation", "pret", "servi"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Statut invalide" });
  }

  const item = db
    .prepare("SELECT * FROM order_items WHERE id = ?")
    .get(id);
  if (!item) {
    return res.status(404).json({ error: "Item introuvable" });
  }

  db.prepare("UPDATE order_items SET status = ? WHERE id = ?")
    .run(status, id);

  const order = db.prepare("SELECT * FROM orders WHERE id = ?")
    .get(item.order_id);

  const io = getIO();
  io.to(item.target).emit("item:statusChanged", {
    itemId: item.id,
    orderId: item.order_id,
    tableId: order.table_id,
    status
  });

  io.emit("order:updated", {
    orderId: order.id
  });

  addLog(
    "item_status_changed",
    `Item #${item.id} de la commande #${item.order_id} → ${status}`,
    { itemId: item.id, orderId: item.order_id, status, target: item.target }
  );

  res.json({ success: true });
}
