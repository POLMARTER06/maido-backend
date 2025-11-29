import { Router } from "express";
import { updateItemStatus } from "../controllers/orderItemsController.js";

const router = Router();

router.patch("/:id/status", updateItemStatus);

export default router;
