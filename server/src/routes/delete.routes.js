import { Router } from "express";
import * as deleteCtroler from "../controllers/delete.controllers.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Nomina
router.delete("/api/nomina/:id", requireAuth, deleteCtroler.deleteNomina);

// Cartas
router.delete("/api/cartas/:id", requireAuth, deleteCtroler.deleteCarta);

export default router;
