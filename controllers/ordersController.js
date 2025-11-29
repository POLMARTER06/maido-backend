import { db } from "../db/database.js";
import { getIO } from "../socket.js";
import { computeTotals } from "../utils/totals.js";
import { generateTicketNumber } from "../utils/tickets.js";
import { addLog } from "../utils/logger.js";

export function getOrders(req, res) {
  const { status } = req.query;
  let rows;
  if (status) {
    rows = db
      .prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC")
      .all(status);
  } else {
    rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  }
  res.json(rows);
}

export function createOrder(req, res) {
  const { tableId, serveurId, items } = req.body;

  if (!tableId || !serveurId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "tableId, serveurId et items sont obligatoires" });
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders (table_id, serveur_id, status)
    VALUES (?, ?, 'en_cours')
  `);
  const result = insertOrder.run(tableId, serveurId);
  const orderId = result.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents, target)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const it of items) {
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(it.productId);
    if (!product) continue;
    insertItem.run(orderId, it.productId, it.quantity || 1, product.price_cents, product.target);
  }

  db.prepare(`
    UPDATE restaurant_tables
    SET status = 'occupee', current_serveur_id = ?
    WHERE id = ?
  `).run(serveurId, tableId);

  const totals = computeTotals(orderId);
  db.prepare(`
    UPDATE orders SET 
      total_ht_cents = ?, 
      total_tva_cents = ?, 
      total_ttc_cents = ?
    WHERE id = ?
  `).run(totals.ht, totals.tva, totals.ttc, orderId);

  addLog(
    "order_created",
    `Commande #${orderId} créée pour table ${tableId}`,
    { orderId, tableId, serveurId, totals }
  );

  const io = getIO();
  io.emit("order:created", {
    orderId,
    tableId,
    serveurId,
    totals
  });

  res.status(201).json({ orderId, totals });
}

export function payOrder(req, res) {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  const table = db.prepare("SELECT * FROM restaurant_tables WHERE id = ?").get(order.table_id);
  const server = db.prepare("SELECT * FROM users WHERE id = ?").get(order.serveur_id);

  db.prepare(`
    UPDATE orders
    SET status = 'payee',
        paid_at = CURRENT_TIMESTAMP,
        payment_method = ?
    WHERE id = ?
  `).run(paymentMethod || "Inconnu", id);

  const ticketNumber = generateTicketNumber();

  const ticketId = db.prepare(`
    INSERT INTO tickets (order_id, number, server_name, table_number, total_ht_cents, total_tva_cents, total_ttc_cents, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.id,
    ticketNumber,
    server ? server.name : "Inconnu",
    table ? table.number : 0,
    order.total_ht_cents,
    order.total_tva_cents,
    order.total_ttc_cents,
    paymentMethod || "Inconnu"
  ).lastInsertRowid;

  const items = db.prepare(`
    SELECT oi.quantity, oi.unit_price_cents, p.name, p.tva_type
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(id);

  const insertItem = db.prepare(`
    INSERT INTO ticket_items (ticket_id, product_name, quantity, unit_price_cents, total_cents, tva_type, tva_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const it of items) {
    const tvaRow = db.prepare("SELECT rate FROM tva_rates WHERE tva_type = ?").get(it.tva_type);
    const rate = tvaRow ? tvaRow.rate : 10;
    insertItem.run(
      ticketId,
      it.name,
      it.quantity,
      it.unit_price_cents,
      it.quantity * it.unit_price_cents,
      it.tva_type,
      rate
    );
  }

  db.prepare(`
    UPDATE restaurant_tables
    SET status = 'libre', current_serveur_id = NULL
    WHERE id = ?
  `).run(order.table_id);

  const io = getIO();
  io.emit("order:paid", {
    orderId: order.id,
    tableId: order.table_id,
    paymentMethod: paymentMethod || "Inconnu"
  });

  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(ticketId);
  ticket.items = db.prepare("SELECT * FROM ticket_items WHERE ticket_id = ?").all(ticketId);

  addLog(
    "order_paid",
    `Commande #${order.id} payée (${paymentMethod || "Inconnu"})`,
    {
      orderId: order.id,
      tableId: order.table_id,
      ticketNumber,
      paymentMethod: paymentMethod || "Inconnu"
    }
  );

  res.json(ticket);
}
