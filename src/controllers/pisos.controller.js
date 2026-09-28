import {
  actualizarPiso as actualizarPisoServicio,
  crearPiso as crearPisoServicio,
  eliminarPiso as eliminarPisoServicio,
  obtenerPisos as obtenerPisosServicio,
} from "../services/pisos.service.js";

import { obtenerIdNumerico } from "../utils/parametros.js";

export async function obtenerPisos(req, res, next) {
  try {
    const pisos = await obtenerPisosServicio(req.usuario.restauranteId);

    return res.json(pisos);
  } catch (error) {
    return next(error);
  }
}

export async function crearPiso(req, res, next) {
  try {
    const piso = await crearPisoServicio(req.usuario.restauranteId, req.body);

    return res.status(201).json(piso);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarPiso(req, res, next) {
  try {
    const pisoId = obtenerIdNumerico(req.params.id);

    const piso = await actualizarPisoServicio(
      req.usuario.restauranteId,
      pisoId,
      req.body,
    );

    return res.json(piso);
  } catch (error) {
    return next(error);
  }
}

export async function eliminarPiso(req, res, next) {
  try {
    const pisoId = obtenerIdNumerico(req.params.id);

    const resultado = await eliminarPisoServicio(
      req.usuario.restauranteId,
      pisoId,
    );

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}
