import { Router } from "express";
import * as getCtroler from "../controllers/get.controllers.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Nomina
router.get("/api/nomina", requireAuth, getCtroler.getNomina);
router.get("/api/nomina/stats", requireAuth, getCtroler.getNominaStats);

// Cartas
router.get("/api/cartas", requireAuth, getCtroler.getCartas);
router.get("/api/cartas/stats", requireAuth, getCtroler.getCartasStats);

export default router;
