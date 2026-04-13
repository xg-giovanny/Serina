import { Router } from "express";
import * as putCtroler from "../controllers/put.controllers.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Nomina
router.put("/api/nomina/:id", requireAuth, putCtroler.updateNomina);

export default router;
