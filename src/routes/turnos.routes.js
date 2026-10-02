import { Router } from "express";

import {
  actualizarTurno,
  cancelarTurno,
  crearTurno,
  llamarTurno,
  obtenerTurnoActual,
  obtenerTurnos,
  obtenerTurnosParaMesa,
} from "../controllers/turnos.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import {
  esquemaActualizarTurno,
  esquemaCrearTurno,
} from "../validators/turnos.validator.js";

const router = Router();

router.get("/", autenticar, autorizarRoles("ADMIN", "HOSTESS"), obtenerTurnos);

router.get(
  "/actual",
  autenticar,
  autorizarRoles("ADMIN", "HOSTESS"),
  obtenerTurnoActual,
);

/*
 * Este endpoint sí puede utilizarlo WAITER.
 *
 * No le da un módulo administrativo de turnos:
 * sólo obtiene los candidatos correspondientes
 * a una mesa que ya está físicamente identificada.
 */
router.get(
  "/para-mesa/:mesaId",
  autenticar,
  autorizarRoles("ADMIN", "HOSTESS", "WAITER"),
  obtenerTurnosParaMesa,
);

router.post(
  "/",
  autenticar,
  autorizarRoles("ADMIN", "HOSTESS"),
  validarCuerpo(esquemaCrearTurno),
  crearTurno,
);

router.patch(
  "/:id",
  autenticar,
  autorizarRoles("ADMIN", "HOSTESS"),
  validarCuerpo(esquemaActualizarTurno),
  actualizarTurno,
);

router.post(
  "/:id/llamar",
  autenticar,
  autorizarRoles("ADMIN", "HOSTESS"),
  llamarTurno,
);

router.post(
  "/:id/cancelar",
  autenticar,
  autorizarRoles("ADMIN", "HOSTESS"),
  cancelarTurno,
);

export default router;
