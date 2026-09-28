import { Router } from "express";

import {
  actualizarRestaurante,
  obtenerRestaurante,
} from "../controllers/restaurante.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import { esquemaActualizarRestaurante } from "../validators/restaurante.validator.js";

const router = Router();

router.get("/", autenticar, obtenerRestaurante);

router.patch(
  "/",
  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaActualizarRestaurante),

  actualizarRestaurante,
);

export default router;
