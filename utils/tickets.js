import { db } from "../db/database.js";

export function generateTicketNumber() {
  const year = new Date().getFullYear();
  const row = db.prepare(
    "SELECT COUNT(*) AS c FROM tickets WHERE number LIKE ?"
  ).get(`T-${year}-%`);
  const count = row ? row.c : 0;
  const seq = String(count + 1).padStart(6, "0");
  return `T-${year}-${seq}`;
}
