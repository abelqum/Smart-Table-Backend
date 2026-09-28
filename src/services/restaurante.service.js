import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

export async function obtenerRestaurante(restauranteId) {
  const restaurante = await prisma.restaurante.findUnique({
    where: {
      id: restauranteId,
    },

    select: {
      id: true,
      nombre: true,
      slug: true,
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

  /*
   * Una cadena vacía significa que
   * no se configuró una URL de menú.
   */
  if (datosActualizar.menuUrl === "") {
    datosActualizar.menuUrl = null;
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
      menuUrl: true,
      activo: true,
    },
  });
}
