import { db } from "./database.js";

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER UNIQUE NOT NULL,
      status TEXT DEFAULT 'libre',
      current_serveur_id INTEGER,
      FOREIGN KEY(current_serveur_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      target TEXT NOT NULL,
      tva_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      serveur_id INTEGER NOT NULL,
      status TEXT DEFAULT 'en_cours',
      total_ht_cents INTEGER DEFAULT 0,
      total_tva_cents INTEGER DEFAULT 0,
      total_ttc_cents INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      paid_at TEXT,
      payment_method TEXT,
      FOREIGN KEY(table_id) REFERENCES restaurant_tables(id),
      FOREIGN KEY(serveur_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      status TEXT DEFAULT 'en_attente',
      target TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS tva_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tva_type TEXT UNIQUE,
      rate REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      number TEXT NOT NULL UNIQUE,
      server_name TEXT NOT NULL,
      table_number INTEGER NOT NULL,
      total_ht_cents INTEGER NOT NULL,
      total_tva_cents INTEGER NOT NULL,
      total_ttc_cents INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS ticket_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      tva_type TEXT NOT NULL,
      tva_rate REAL NOT NULL,
      FOREIGN KEY(ticket_id) REFERENCES tickets(id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      meta TEXT
    );
  `);
}
