import { Router } from "express";

import {
  cancelarTurno,
  crearTurno,
  obtenerTurnos,
} from "../controllers/turnos.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import { esquemaCrearTurno } from "../validators/turnos.validator.js";

const router = Router();

router.get("/", autenticar, obtenerTurnos);

router.post(
  "/",
  autenticar,

  autorizarRoles("ADMIN", "HOSTESS"),

  validarCuerpo(esquemaCrearTurno),

  crearTurno,
);

router.post(
  "/:id/cancelar",
  autenticar,

  autorizarRoles("ADMIN", "HOSTESS"),

  cancelarTurno,
);

export default router;
