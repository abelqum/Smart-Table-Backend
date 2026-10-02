import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

function convertirUsuario(usuario) {
  return {
    id: usuario.id,

    nombre: usuario.nombre,

    correo: usuario.correo,

    rol: usuario.rol,

    activo: usuario.activo,

    creadoEn: usuario.creadoEn,
  };
}

async function comprobarCorreoDisponible(correo, usuarioIgnoradoId = null) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      correo,
    },

    select: {
      id: true,
    },
  });

  if (usuario && usuario.id !== usuarioIgnoradoId) {
    throw crearErrorHttp(
      "Ya existe un usuario con ese correo electrónico.",
      409,
    );
  }
}

export async function obtenerUsuarios(restauranteId) {
  const usuarios = await prisma.usuario.findMany({
    where: {
      restauranteId,
    },

    select: {
      id: true,

      nombre: true,

      correo: true,

      rol: true,

      activo: true,

      creadoEn: true,
    },

    orderBy: [
      {
        activo: "desc",
      },

      {
        nombre: "asc",
      },
    ],
  });

  return usuarios.map(convertirUsuario);
}

export async function crearUsuario(restauranteId, datos) {
  await comprobarCorreoDisponible(datos.correo);

  const passwordHash = await bcrypt.hash(datos.contrasena, 12);

  const usuario = await prisma.usuario.create({
    data: {
      restauranteId,

      nombre: datos.nombre,

      correo: datos.correo,

      passwordHash,

      rol: datos.rol,

      activo: true,
    },

    select: {
      id: true,

      nombre: true,

      correo: true,

      rol: true,

      activo: true,

      creadoEn: true,
    },
  });

  return convertirUsuario(usuario);
}

export async function actualizarUsuario(
  restauranteId,
  usuarioAdministradorId,
  usuarioId,
  datos,
) {
  const usuario = await prisma.usuario.findFirst({
    where: {
      id: usuarioId,

      restauranteId,
    },
  });

  if (!usuario) {
    throw crearErrorHttp("Usuario no encontrado.", 404);
  }

  /*
   * El administrador puede modificar sus
   * propios datos desde Mi cuenta.
   *
   * Desde el módulo Usuarios no permitimos
   * que se quite a sí mismo los permisos
   * de administrador ni que se desactive.
   */
  if (
    usuario.id === usuarioAdministradorId &&
    Object.prototype.hasOwnProperty.call(datos, "rol") &&
    datos.rol !== usuario.rol
  ) {
    throw crearErrorHttp(
      "No puedes modificar tu propio rol desde el módulo de usuarios.",
      409,
    );
  }

  if (usuario.id === usuarioAdministradorId && datos.activo === false) {
    throw crearErrorHttp("No puedes desactivar tu propia cuenta.", 409);
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

      creadoEn: true,
    },
  });

  return convertirUsuario(usuarioActualizado);
}

export async function restablecerContrasena(
  restauranteId,
  usuarioAdministradorId,
  usuarioId,
  nuevaContrasena,
) {
  const usuario = await prisma.usuario.findFirst({
    where: {
      id: usuarioId,

      restauranteId,
    },
  });

  if (!usuario) {
    throw crearErrorHttp("Usuario no encontrado.", 404);
  }

  /*
   * Para la propia cuenta utilizamos
   * el flujo de Mi cuenta, que exige
   * la contraseña actual.
   */
  if (usuario.id === usuarioAdministradorId) {
    throw crearErrorHttp(
      "Para cambiar tu propia contraseña utiliza Mi cuenta.",
      409,
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
    mensaje: "Contraseña restablecida correctamente.",
  };
}
