import { Router } from "express";
import * as postCtroler from "../controllers/post.controllers.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Auth (Sin middleware, ya que son de entrada)
router.post("/api/auth/login", postCtroler.loginUsuario);
router.post("/api/auth/register", postCtroler.registerUsuario);

// Nomina
router.post("/api/nomina", requireAuth, postCtroler.createNomina);

// Cartas
router.post("/api/cartas/import", requireAuth, postCtroler.importCartasBulk);

export default router;
