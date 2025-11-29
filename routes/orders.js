import { Router } from "express";
import { createOrder, getOrders, payOrder } from "../controllers/ordersController.js";
import { addItemsToOrder } from "../controllers/orderItemsController.js";

const router = Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.post("/:id/items", addItemsToOrder);
router.patch("/:id/pay", payOrder);

export default router;
