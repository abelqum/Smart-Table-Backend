import { Router } from "express";

import { obtenerEventos } from "../controllers/eventos.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

const router = Router();

router.get("/", autenticar, obtenerEventos);

export default router;
