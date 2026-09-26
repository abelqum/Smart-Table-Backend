import { Router } from "express";

import { prisma } from "../config/prisma.js";

const router = Router();

/*
 * Comprueba tanto que Express está funcionando
 * como que existe conexión real con PostgreSQL.
 *
 * GET /api/health
 */
router.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`
      SELECT 1
    `;

    return res.json({
      estado: "OK",
      servicio: "SmartTable Backend",
      baseDatos: "OK",
      fechaHora: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return res.status(503).json({
      estado: "ERROR",
      servicio: "SmartTable Backend",
      baseDatos: "NO_DISPONIBLE",
    });
  }
});

export default router;
