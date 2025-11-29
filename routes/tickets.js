import { Router } from "express";
import { getTickets, getTicket } from "../controllers/ticketsController.js";

const router = Router();

router.get("/", getTickets);
router.get("/:id", getTicket);

export default router;
