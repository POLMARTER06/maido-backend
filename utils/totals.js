import { db } from "../db/database.js";

export function computeTotals(orderId) {
  const items = db.prepare(`
    SELECT oi.quantity, oi.unit_price_cents, p.tva_type
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(orderId);

  let ht = 0;
  let tva = 0;
  let ttc = 0;

  for (const item of items) {
    const tvaRow = db
      .prepare("SELECT rate FROM tva_rates WHERE tva_type = ?")
      .get(item.tva_type);
    const rate = tvaRow ? tvaRow.rate : 10;

    const totalItemTTC = item.unit_price_cents * item.quantity;
    const totalItemHT = totalItemTTC / (1 + rate / 100);
    const totalItemTVA = totalItemTTC - totalItemHT;

    ht += totalItemHT;
    tva += totalItemTVA;
    ttc += totalItemTTC;
  }

  return {
    ht: Math.round(ht),
    tva: Math.round(tva),
    ttc: Math.round(ttc)
  };
}
