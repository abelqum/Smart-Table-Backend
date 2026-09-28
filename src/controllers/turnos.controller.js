import {
  cancelarTurno as cancelarTurnoServicio,
  crearTurno as crearTurnoServicio,
  obtenerTurnos as obtenerTurnosServicio,
} from "../services/turnos.service.js";

import { obtenerIdNumerico } from "../utils/parametros.js";

export async function obtenerTurnos(req, res, next) {
  try {
    const turnos = await obtenerTurnosServicio(req.usuario.restauranteId);

    return res.json(turnos);
  } catch (error) {
    return next(error);
  }
}

export async function crearTurno(req, res, next) {
  try {
    const turno = await crearTurnoServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      req.body,
    );

    return res.status(201).json(turno);
  } catch (error) {
    return next(error);
  }
}

export async function cancelarTurno(req, res, next) {
  try {
    const turnoId = obtenerIdNumerico(req.params.id);

    const turno = await cancelarTurnoServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      turnoId,
    );

    return res.json(turno);
  } catch (error) {
    return next(error);
  }
}
