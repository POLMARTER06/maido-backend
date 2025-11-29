import { db } from "../db/database.js";

export function getTickets(req, res) {
  const rows = db
    .prepare("SELECT * FROM tickets ORDER BY created_at DESC")
    .all();
  res.json(rows);
}

export function getTicket(req, res) {
  const { id } = req.params;
  const ticket = db
    .prepare("SELECT * FROM tickets WHERE id = ?")
    .get(id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket introuvable" });
  }
  ticket.items = db
    .prepare("SELECT * FROM ticket_items WHERE ticket_id = ?")
    .all(id);
  res.json(ticket);
}
