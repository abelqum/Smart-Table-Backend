import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

import { entorno } from "../config/entorno.js";

export async function autenticar(req, res, next) {
  try {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión.",
      });
    }

    const token = encabezado.substring(7);

    let payload;

    try {
      payload = jwt.verify(token, entorno.jwtSecret);
    } catch {
      return res.status(401).json({
        mensaje: "La sesión no es válida o ha expirado.",
      });
    }

    const usuarioId = Number(payload.sub);

    if (!Number.isInteger(usuarioId)) {
      return res.status(401).json({
        mensaje: "La sesión no es válida.",
      });
    }

    /*
     * No confiamos únicamente en lo que trae el JWT.
     *
     * Volvemos a consultar el usuario para comprobar
     * que sigue existiendo y continúa activo.
     */
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },

      select: {
        id: true,

        restauranteId: true,

        nombre: true,

        correo: true,

        rol: true,

        activo: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        mensaje: "La sesión ya no es válida.",
      });
    }

    /*
     * Desde este punto cualquier controlador
     * protegido puede utilizar:
     *
     * req.usuario.id
     * req.usuario.restauranteId
     * req.usuario.rol
     */
    req.usuario = usuario;

    return next();
  } catch (error) {
    return next(error);
  }
}
