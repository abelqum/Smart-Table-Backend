import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

import { entorno } from "../config/entorno.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

function construirUsuarioPublico(usuario) {
  return {
    id: usuario.id,

    nombre: usuario.nombre,

    correo: usuario.correo,

    rol: usuario.rol,
  };
}

function generarToken(usuario) {
  return jwt.sign(
    {
      restauranteId: usuario.restauranteId,

      rol: usuario.rol,
    },

    entorno.jwtSecret,

    {
      subject: String(usuario.id),

      expiresIn: "8h",
    },
  );
}

export async function iniciarSesion({ correo, password }) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  /*
   * Utilizamos el mismo mensaje cuando:
   *
   * - el correo no existe
   * - la contraseña es incorrecta
   *
   * De esta forma no revelamos qué cuentas
   * existen dentro del sistema.
   */
  if (!usuario) {
    throw crearErrorHttp("Correo o contraseña incorrectos.", 401);
  }

  if (!usuario.activo) {
    throw crearErrorHttp("La cuenta se encuentra desactivada.", 403);
  }

  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

  if (!passwordValido) {
    throw crearErrorHttp("Correo o contraseña incorrectos.", 401);
  }

  const token = generarToken(usuario);

  return {
    token,

    usuario: construirUsuarioPublico(usuario),
  };
}

export async function obtenerPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },

    select: {
      id: true,

      nombre: true,

      correo: true,

      rol: true,

      activo: true,
    },
  });

  if (!usuario || !usuario.activo) {
    throw crearErrorHttp("La sesión ya no es válida.", 401);
  }

  return {
    id: usuario.id,

    nombre: usuario.nombre,

    correo: usuario.correo,

    rol: usuario.rol,
  };
}
