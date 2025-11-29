import express from "express";
import cors from "cors";
import { createServer } from "http";
import { config } from "dotenv";
import { migrate } from "./db/migrations.js";
import { seed } from "./db/seeds.js";
import ordersRouter from "./routes/orders.js";
import orderItemsRouter from "./routes/orderItems.js";
import tablesRouter from "./routes/tables.js";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import tvaRouter from "./routes/tva.js";
import ticketsRouter from "./routes/tickets.js";
import logsRouter from "./routes/logs.js";
import barRouter from "./routes/bar.js";
import { initSocket } from "./socket.js";

config();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.get("/api/ping", (req, res) => res.json({ ok: true }));

app.use("/api/orders", ordersRouter);
app.use("/api/items", orderItemsRouter);
app.use("/api/tables", tablesRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/tva", tvaRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/bar", barRouter);

migrate();
seed();

initSocket(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend LA TABLE DU MAIDO v3 sur http://localhost:${PORT}`);
});
