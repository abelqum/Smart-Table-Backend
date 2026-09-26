import { Router } from "express";

const router = Router();

/*
 * Este endpoint permite comprobar rápidamente
 * que el backend se encuentra disponible.
 *
 * GET /api/health
 */
router.get("/", (req, res) => {
  return res.json({
    estado: "OK",

    servicio: "SmartTable Backend",

    fechaHora: new Date().toISOString(),
  });
});

export default router;
