import { Router } from "express";

import {
  resolverNfc,
  prepararVinculacionNfc,
  confirmarVinculacionNfc,
  cancelarVinculacionNfc,
} from "../controllers/nfc.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import {
  esquemaResolverNfc,
  esquemaPrepararVinculacionNfc,
  esquemaConfirmarVinculacionNfc,
  esquemaCancelarVinculacionNfc,
} from "../validators/nfc.validator.js";

const router = Router();

router.post(
  "/resolver",

  autenticar,

  autorizarRoles("ADMIN", "HOSTESS", "WAITER", "CLEANING"),

  validarCuerpo(esquemaResolverNfc),

  resolverNfc,
);

router.post(
  "/vinculaciones/preparar",

  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaPrepararVinculacionNfc),

  prepararVinculacionNfc,
);

router.post(
  "/vinculaciones/confirmar",

  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaConfirmarVinculacionNfc),

  confirmarVinculacionNfc,
);

router.post(
  "/vinculaciones/cancelar",

  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaCancelarVinculacionNfc),

  cancelarVinculacionNfc,
);

export default router;
