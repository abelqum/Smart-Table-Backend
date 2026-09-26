import { Router } from "express";

import {
  iniciarSesion,
  obtenerPerfil,
} from "../controllers/auth.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { validarCuerpo } from "../middlewares/validar.js";

import { esquemaLogin } from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/login",

  validarCuerpo(esquemaLogin),

  iniciarSesion,
);

router.get(
  "/me",

  autenticar,

  obtenerPerfil,
);

export default router;
