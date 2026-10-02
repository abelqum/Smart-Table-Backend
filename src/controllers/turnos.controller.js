import {
  actualizarTurno as actualizarTurnoServicio,
  cancelarTurno as cancelarTurnoServicio,
  crearTurno as crearTurnoServicio,
  llamarTurno as llamarTurnoServicio,
  obtenerTurnoActual as obtenerTurnoActualServicio,
  obtenerTurnos as obtenerTurnosServicio,
  obtenerTurnosParaMesa as obtenerTurnosParaMesaServicio,
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

export async function obtenerTurnoActual(req, res, next) {
  try {
    const turno = await obtenerTurnoActualServicio(req.usuario.restauranteId);

    return res.json(turno);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerTurnosParaMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.mesaId, "mesaId");

    const resultado = await obtenerTurnosParaMesaServicio(
      req.usuario.restauranteId,
      mesaId,
      req.usuario.rol,
    );

    return res.json(resultado);
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

export async function actualizarTurno(req, res, next) {
  try {
    const turnoId = obtenerIdNumerico(req.params.id);

    const turno = await actualizarTurnoServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      turnoId,
      req.body,
    );

    return res.json(turno);
  } catch (error) {
    return next(error);
  }
}

export async function llamarTurno(req, res, next) {
  try {
    const turnoId = obtenerIdNumerico(req.params.id);

    const turno = await llamarTurnoServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      turnoId,
    );

    return res.json(turno);
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
