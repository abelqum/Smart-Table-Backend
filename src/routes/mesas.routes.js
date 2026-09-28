import { Router } from "express";

import {
  actualizarMesa,
  asignarTurnoAMesa,
  crearMesa,
  eliminarMesa,
  finalizarLimpiezaMesa,
  iniciarLimpiezaMesa,
  obtenerMesa,
  obtenerMesas,
  registrarSalidaClientes,
} from "../controllers/mesas.controller.js";

import { autenticar } from "../middlewares/autenticacion.js";

import { autorizarRoles } from "../middlewares/roles.js";

import { validarCuerpo } from "../middlewares/validar.js";

import {
  esquemaActualizarMesa,
  esquemaAsignarMesa,
  esquemaCrearMesa,
} from "../validators/mesas.validator.js";

const router = Router();

router.get("/", autenticar, obtenerMesas);

router.get("/:id", autenticar, obtenerMesa);

router.post(
  "/",
  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaCrearMesa),

  crearMesa,
);

router.patch(
  "/:id",
  autenticar,

  autorizarRoles("ADMIN"),

  validarCuerpo(esquemaActualizarMesa),

  actualizarMesa,
);

router.delete(
  "/:id",
  autenticar,

  autorizarRoles("ADMIN"),

  eliminarMesa,
);

router.post(
  "/:id/asignar",
  autenticar,

  autorizarRoles("ADMIN", "HOSTESS"),

  validarCuerpo(esquemaAsignarMesa),

  asignarTurnoAMesa,
);

router.post(
  "/:id/clientes-retirados",
  autenticar,

  autorizarRoles("ADMIN", "HOSTESS", "WAITER"),

  registrarSalidaClientes,
);

router.post(
  "/:id/limpieza/iniciar",
  autenticar,

  autorizarRoles("ADMIN", "HOSTESS", "CLEANING"),

  iniciarLimpiezaMesa,
);

router.post(
  "/:id/limpieza/finalizar",
  autenticar,

  autorizarRoles("ADMIN", "HOSTESS", "CLEANING"),

  finalizarLimpiezaMesa,
);

export default router;
