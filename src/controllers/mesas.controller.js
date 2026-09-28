import {
  actualizarMesa as actualizarMesaServicio,
  asignarTurnoAMesa as asignarTurnoAMesaServicio,
  crearMesa as crearMesaServicio,
  eliminarMesa as eliminarMesaServicio,
  finalizarLimpiezaMesa as finalizarLimpiezaMesaServicio,
  iniciarLimpiezaMesa as iniciarLimpiezaMesaServicio,
  obtenerMesa as obtenerMesaServicio,
  obtenerMesas as obtenerMesasServicio,
  registrarSalidaClientes as registrarSalidaClientesServicio,
} from "../services/mesas.service.js";

import { obtenerIdNumerico } from "../utils/parametros.js";

export async function obtenerMesas(req, res, next) {
  try {
    const mesas = await obtenerMesasServicio(req.usuario.restauranteId);

    return res.json(mesas);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const mesa = await obtenerMesaServicio(req.usuario.restauranteId, mesaId);

    return res.json(mesa);
  } catch (error) {
    return next(error);
  }
}

export async function crearMesa(req, res, next) {
  try {
    const mesa = await crearMesaServicio(req.usuario.restauranteId, req.body);

    return res.status(201).json(mesa);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const mesa = await actualizarMesaServicio(
      req.usuario.restauranteId,
      mesaId,
      req.body,
    );

    return res.json(mesa);
  } catch (error) {
    return next(error);
  }
}

export async function eliminarMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const resultado = await eliminarMesaServicio(
      req.usuario.restauranteId,
      mesaId,
    );

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}

export async function asignarTurnoAMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const mesa = await asignarTurnoAMesaServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      mesaId,
      req.body,
    );

    return res.json(mesa);
  } catch (error) {
    return next(error);
  }
}

export async function registrarSalidaClientes(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const mesa = await registrarSalidaClientesServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      mesaId,
    );

    return res.json(mesa);
  } catch (error) {
    return next(error);
  }
}

export async function iniciarLimpiezaMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const mesa = await iniciarLimpiezaMesaServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      mesaId,
    );

    return res.json(mesa);
  } catch (error) {
    return next(error);
  }
}

export async function finalizarLimpiezaMesa(req, res, next) {
  try {
    const mesaId = obtenerIdNumerico(req.params.id);

    const mesa = await finalizarLimpiezaMesaServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      mesaId,
    );

    return res.json(mesa);
  } catch (error) {
    return next(error);
  }
}
