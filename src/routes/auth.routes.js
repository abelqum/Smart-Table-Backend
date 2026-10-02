import { Router } from "express";

import {
  actualizarMiPerfil,
  cambiarContrasena,
  iniciarSesion,
  obtenerPerfil,
} from "../controllers/auth.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { validarCuerpo } from "../middlewares/validar.js";

import {
  esquemaActualizarMiPerfil,
  esquemaCambiarContrasena,
  esquemaLogin,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validarCuerpo(esquemaLogin), iniciarSesion);

router.get("/me", autenticar, obtenerPerfil);

router.patch(
  "/me",
  autenticar,
  validarCuerpo(esquemaActualizarMiPerfil),
  actualizarMiPerfil,
);

router.patch(
  "/me/contrasena",
  autenticar,
  validarCuerpo(esquemaCambiarContrasena),
  cambiarContrasena,
);

export default router;
