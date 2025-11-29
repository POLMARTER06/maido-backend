import Database from "better-sqlite3";

export const db = new Database("./restaurant.db");
db.pragma("foreign_keys = ON");
