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

async function comprobarCorreoDisponible(correo, usuarioId) {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo,
    },

    select: {
      id: true,
    },
  });

  if (usuarioExistente && usuarioExistente.id !== usuarioId) {
    throw crearErrorHttp(
      "Ya existe un usuario con ese correo electrónico.",
      409,
    );
  }
}

export async function iniciarSesion({ correo, contrasena }) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  if (!usuario) {
    throw crearErrorHttp("Correo o contraseña incorrectos.", 401);
  }

  if (!usuario.activo) {
    throw crearErrorHttp("La cuenta se encuentra desactivada.", 403);
  }

  const contrasenaValida = await bcrypt.compare(
    contrasena,
    usuario.passwordHash,
  );

  if (!contrasenaValida) {
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

  return construirUsuarioPublico(usuario);
}

export async function actualizarMiPerfil(usuarioId, datos) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
  });

  if (!usuario || !usuario.activo) {
    throw crearErrorHttp("La sesión ya no es válida.", 401);
  }

  if (datos.correo && datos.correo !== usuario.correo) {
    await comprobarCorreoDisponible(datos.correo, usuario.id);
  }

  const usuarioActualizado = await prisma.usuario.update({
    where: {
      id: usuario.id,
    },

    data: datos,

    select: {
      id: true,

      nombre: true,

      correo: true,

      rol: true,

      activo: true,
    },
  });

  return construirUsuarioPublico(usuarioActualizado);
}

export async function cambiarContrasena(
  usuarioId,
  { contrasenaActual, nuevaContrasena },
) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
  });

  if (!usuario || !usuario.activo) {
    throw crearErrorHttp("La sesión ya no es válida.", 401);
  }

  const contrasenaActualValida = await bcrypt.compare(
    contrasenaActual,
    usuario.passwordHash,
  );

  if (!contrasenaActualValida) {
    throw crearErrorHttp("La contraseña actual es incorrecta.", 400);
  }

  const mismaContrasena = await bcrypt.compare(
    nuevaContrasena,
    usuario.passwordHash,
  );

  if (mismaContrasena) {
    throw crearErrorHttp(
      "La nueva contraseña debe ser diferente a la actual.",
      400,
    );
  }

  const passwordHash = await bcrypt.hash(nuevaContrasena, 12);

  await prisma.usuario.update({
    where: {
      id: usuario.id,
    },

    data: {
      passwordHash,
    },
  });

  return {
    mensaje: "Contraseña actualizada correctamente.",
  };
}
