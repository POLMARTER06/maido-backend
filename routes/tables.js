import { Router } from "express";
import { getTables, createTable, updateTable } from "../controllers/tablesController.js";

const router = Router();

router.get("/", getTables);
router.post("/", createTable);
router.patch("/:id", updateTable);

export default router;
