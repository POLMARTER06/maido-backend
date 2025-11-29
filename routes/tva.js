import { Router } from "express";
import { getTVA, updateTVA } from "../controllers/tvaController.js";

const router = Router();

router.get("/", getTVA);
router.patch("/", updateTVA);

export default router;
