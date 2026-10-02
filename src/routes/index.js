import { Router } from "express";

import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import eventosRoutes from "./eventos.routes.js";
import healthRoutes from "./health.routes.js";
import mesasRoutes from "./mesas.routes.js";
import pisosRoutes from "./pisos.routes.js";
import restauranteRoutes from "./restaurante.routes.js";
import turnosRoutes from "./turnos.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import nfcRoutes from "./nfc.routes.js";
const router = Router();

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/restaurante", restauranteRoutes);

router.use("/pisos", pisosRoutes);

router.use("/mesas", mesasRoutes);

router.use("/turnos", turnosRoutes);

router.use("/eventos", eventosRoutes);

router.use("/usuarios", usuariosRoutes);

router.use("/nfc", nfcRoutes);
export default router;
