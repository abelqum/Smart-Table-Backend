import { Router } from "express";

import { obtenerResumenDashboard } from "../controllers/dashboard.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

const router = Router();

router.get("/resumen", autenticar, obtenerResumenDashboard);

export default router;
