import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

function normalizarCampoOpcional(valor) {
  if (valor === "") {
    return null;
  }

  return valor;
}

export async function obtenerRestaurante(restauranteId) {
  const restaurante = await prisma.restaurante.findUnique({
    where: {
      id: restauranteId,
    },

    select: {
      id: true,

      nombre: true,

      slug: true,

      telefono: true,

      direccion: true,

      menuUrl: true,

      activo: true,
    },
  });

  if (!restaurante) {
    throw crearErrorHttp("Restaurante no encontrado.", 404);
  }

  return restaurante;
}

export async function actualizarRestaurante(restauranteId, datos) {
  const datosActualizar = {
    ...datos,
  };

  if (Object.prototype.hasOwnProperty.call(datosActualizar, "telefono")) {
    datosActualizar.telefono = normalizarCampoOpcional(
      datosActualizar.telefono,
    );
  }

  if (Object.prototype.hasOwnProperty.call(datosActualizar, "direccion")) {
    datosActualizar.direccion = normalizarCampoOpcional(
      datosActualizar.direccion,
    );
  }

  if (Object.prototype.hasOwnProperty.call(datosActualizar, "menuUrl")) {
    datosActualizar.menuUrl = normalizarCampoOpcional(datosActualizar.menuUrl);
  }

  return prisma.restaurante.update({
    where: {
      id: restauranteId,
    },

    data: datosActualizar,

    select: {
      id: true,

      nombre: true,

      slug: true,

      telefono: true,

      direccion: true,

      menuUrl: true,

      activo: true,
    },
  });
}
