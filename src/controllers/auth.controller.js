import {
  actualizarMiPerfil as actualizarMiPerfilServicio,
  cambiarContrasena as cambiarContrasenaServicio,
  iniciarSesion as iniciarSesionServicio,
  obtenerPerfil as obtenerPerfilServicio,
} from "../services/auth.service.js";

export async function iniciarSesion(req, res, next) {
  try {
    const resultado = await iniciarSesionServicio(req.body);

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerPerfil(req, res, next) {
  try {
    const usuario = await obtenerPerfilServicio(req.usuario.id);

    return res.json(usuario);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarMiPerfil(req, res, next) {
  try {
    const usuario = await actualizarMiPerfilServicio(req.usuario.id, req.body);

    return res.json(usuario);
  } catch (error) {
    return next(error);
  }
}

export async function cambiarContrasena(req, res, next) {
  try {
    const resultado = await cambiarContrasenaServicio(req.usuario.id, req.body);

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}
