import { Router } from "express";
import { getBarItems } from "../controllers/barController.js";

const router = Router();

router.get("/", getBarItems);

export default router;
