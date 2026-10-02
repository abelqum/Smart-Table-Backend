import { Router } from "express";

import {
  actualizarUsuario,
  crearUsuario,
  obtenerUsuarios,
  restablecerContrasena,
} from "../controllers/usuarios.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import {
  esquemaActualizarUsuario,
  esquemaCrearUsuario,
  esquemaRestablecerContrasena,
} from "../validators/usuarios.validator.js";

const router = Router();

router.get("/", autenticar, autorizarRoles("ADMIN"), obtenerUsuarios);

router.post(
  "/",
  autenticar,
  autorizarRoles("ADMIN"),
  validarCuerpo(esquemaCrearUsuario),
  crearUsuario,
);

router.patch(
  "/:id",
  autenticar,
  autorizarRoles("ADMIN"),
  validarCuerpo(esquemaActualizarUsuario),
  actualizarUsuario,
);

router.post(
  "/:id/restablecer-contrasena",
  autenticar,
  autorizarRoles("ADMIN"),
  validarCuerpo(esquemaRestablecerContrasena),
  restablecerContrasena,
);

export default router;
