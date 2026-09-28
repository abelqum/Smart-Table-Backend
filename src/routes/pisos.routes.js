import { Router } from "express";

import {
  actualizarPiso,
  crearPiso,
  eliminarPiso,
  obtenerPisos,
} from "../controllers/pisos.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import {
  esquemaActualizarPiso,
  esquemaCrearPiso,
} from "../validators/pisos.validator.js";

const router = Router();

router.get("/", autenticar, obtenerPisos);

router.post(
  "/",
  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaCrearPiso),

  crearPiso,
);

router.patch(
  "/:id",
  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaActualizarPiso),

  actualizarPiso,
);

router.delete(
  "/:id",
  autenticar,

  autorizarRoles("ADMIN"),

  eliminarPiso,
);

export default router;
