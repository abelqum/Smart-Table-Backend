import {
  actualizarUsuario as actualizarUsuarioServicio,
  crearUsuario as crearUsuarioServicio,
  obtenerUsuarios as obtenerUsuariosServicio,
  restablecerContrasena as restablecerContrasenaServicio,
} from "../services/usuarios.service.js";

import { obtenerIdNumerico } from "../utils/parametros.js";

export async function obtenerUsuarios(req, res, next) {
  try {
    const usuarios = await obtenerUsuariosServicio(req.usuario.restauranteId);

    return res.json(usuarios);
  } catch (error) {
    return next(error);
  }
}

export async function crearUsuario(req, res, next) {
  try {
    const usuario = await crearUsuarioServicio(
      req.usuario.restauranteId,
      req.body,
    );

    return res.status(201).json(usuario);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarUsuario(req, res, next) {
  try {
    const usuarioId = obtenerIdNumerico(req.params.id);

    const usuario = await actualizarUsuarioServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      usuarioId,
      req.body,
    );

    return res.json(usuario);
  } catch (error) {
    return next(error);
  }
}

export async function restablecerContrasena(req, res, next) {
  try {
    const usuarioId = obtenerIdNumerico(req.params.id);

    const resultado = await restablecerContrasenaServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      usuarioId,
      req.body.nuevaContrasena,
    );

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}
