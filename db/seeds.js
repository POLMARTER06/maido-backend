import { db } from "./database.js";

export function seed() {
  const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (userCount === 0) {
    const insertUser = db.prepare("INSERT INTO users (name, role, active) VALUES (?, ?, 1)");
    insertUser.run("Marie Dubois", "serveur");
insertUser.run("Jean Martin", "serveur");
insertUser.run("Sophie Laurent", "serveur");
insertUser.run("Cuisine", "cuisine");
insertUser.run("Bar", "bar");
insertUser.run("Caisse", "caisse");

  }

  const tableCount = db.prepare("SELECT COUNT(*) AS c FROM restaurant_tables").get().c;
  if (tableCount === 0) {
    const insertTable = db.prepare("INSERT INTO restaurant_tables (number, status) VALUES (?, 'libre')");
    for (let i = 1; i <= 12; i++) {
      insertTable.run(i);
    }
  }

  const tvaCount = db.prepare("SELECT COUNT(*) AS c FROM tva_rates").get().c;
  if (tvaCount === 0) {
    const insertTVA = db.prepare("INSERT INTO tva_rates (tva_type, rate) VALUES (?, ?)");
    insertTVA.run("restaurant", 8.5);
    insertTVA.run("boissons_alcoolisees", 8.5);
    insertTVA.run("alimentaire", 2.1);
    insertTVA.run("boissons_non_alcoolisees", 2.1);
  }

  const prodCount = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
  if (prodCount === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (code, name, price_cents, category, sub_category, target, tva_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertProd.run("e1", "Carpaccio de bœuf", 1800, "entree", null, "cuisine", "restaurant");
    insertProd.run("e2", "Foie gras poêlé", 2200, "entree", null, "cuisine", "restaurant");

    insertProd.run("p1", "Magret de canard", 3200, "plat", null, "cuisine", "restaurant");
    insertProd.run("p2", "Poisson du jour grillé", 3500, "plat", null, "cuisine", "restaurant");

    insertProd.run("b11", "Bière Dodo (33cl)", 600, "boisson", "bieres", "bar", "boissons_alcoolisees");
    insertProd.run("b12", "Bière Bourbon (33cl)", 600, "boisson", "bieres", "bar", "boissons_alcoolisees");

    insertProd.run("b1", "Eau plate 1L", 400, "boisson", "eaux", "bar", "boissons_non_alcoolisees");
    insertProd.run("b2", "Eau gazeuse 1L", 400, "boisson", "eaux", "bar", "boissons_non_alcoolisees");

    insertProd.run("d1", "Fondant au chocolat", 1200, "dessert", null, "cuisine", "restaurant");
    insertProd.run("d2", "Crème brûlée vanille", 1000, "dessert", null, "cuisine", "restaurant");
  }
}
