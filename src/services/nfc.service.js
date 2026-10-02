import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../config/prisma.js";

import { crearErrorHttp } from "../utils/errorHttp.js";

function obtenerHashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function generarTokenNfc() {
  /*
   * 16 bytes = 128 bits.
   *
   * El token que va físicamente en la etiqueta
   * no contiene el ID de la mesa ni información
   * semántica del restaurante.
   */
  return randomBytes(16).toString("hex");
}

function obtenerAccionesPermitidas(estadoMesa, rolUsuario) {
  const puedeAsignar = ["ADMIN", "HOSTESS", "WAITER"].includes(rolUsuario);

  const puedeRegistrarSalida = ["ADMIN", "HOSTESS", "WAITER"].includes(
    rolUsuario,
  );

  /*
   * Decisión actual del proyecto:
   *
   * el mesero también puede ejecutar
   * el ciclo de limpieza.
   */
  const puedeLimpiar = ["ADMIN", "HOSTESS", "WAITER", "CLEANING"].includes(
    rolUsuario,
  );

  if (estadoMesa === "AVAILABLE" && puedeAsignar) {
    return ["CONFIRMAR_CLIENTE"];
  }

  if (estadoMesa === "OCCUPIED" && puedeRegistrarSalida) {
    return ["CLIENTES_RETIRADOS"];
  }

  if (estadoMesa === "DIRTY" && puedeLimpiar) {
    return ["INICIAR_LIMPIEZA"];
  }

  if (estadoMesa === "CLEANING" && puedeLimpiar) {
    return ["FINALIZAR_LIMPIEZA"];
  }

  return [];
}

function obtenerAccionSugerida(acciones) {
  const accion = acciones[0];

  if (!accion) {
    return null;
  }

  const titulos = {
    CONFIRMAR_CLIENTE: "Confirmar cliente",

    CLIENTES_RETIRADOS: "Clientes se retiraron",

    INICIAR_LIMPIEZA: "Iniciar limpieza",

    FINALIZAR_LIMPIEZA: "Finalizar limpieza",
  };

  return {
    codigo: accion,

    titulo: titulos[accion] ?? accion,
  };
}

function convertirMesa(mesa) {
  const sesionActiva = mesa.sesiones?.[0] ?? null;

  return {
    id: mesa.id,

    numero: mesa.numero,

    capacidad: mesa.capacidad,

    estado: mesa.estado,

    pisoId: mesa.pisoId,

    posicionX: mesa.posicionX,

    posicionY: mesa.posicionY,

    forma: mesa.forma,

    piso: {
      id: mesa.piso.id,

      nombre: mesa.piso.nombre,
    },

    turnoAsignado: sesionActiva
      ? {
          id: sesionActiva.turno.id,

          numero: sesionActiva.turno.numero,

          nombre: sesionActiva.turno.nombre,

          personas: sesionActiva.turno.personas,

          excedeCapacidad: sesionActiva.excedeCapacidad,

          personasExtra: sesionActiva.personasExtra,

          excepcionCapacidadAutorizada:
            sesionActiva.excepcionCapacidadAutorizada,
        }
      : null,
  };
}

export async function resolverNfc(restauranteId, usuarioId, rolUsuario, token) {
  const tokenHash = obtenerHashToken(token);

  const etiqueta = await prisma.etiquetaNfc.findFirst({
    where: {
      tokenHash,

      restauranteId,

      activa: true,

      tipo: "TABLE_OPERATION",
    },

    include: {
      mesa: {
        include: {
          piso: {
            select: {
              id: true,

              nombre: true,
            },
          },

          sesiones: {
            where: {
              fin: null,
            },

            take: 1,

            orderBy: {
              inicio: "desc",
            },

            include: {
              turno: true,
            },
          },
        },
      },
    },
  });

  /*
   * No diferenciamos entre:
   *
   * - token inexistente
   * - etiqueta de otro restaurante
   * - etiqueta desactivada
   *
   * Evitamos revelar información innecesaria.
   */
  if (!etiqueta) {
    throw crearErrorHttp(
      "La etiqueta NFC no está registrada en este restaurante.",
      404,
    );
  }

  if (!etiqueta.mesa || !etiqueta.mesa.activa) {
    throw crearErrorHttp(
      "La etiqueta NFC no está vinculada a una mesa activa.",
      409,
    );
  }

  const mesa = etiqueta.mesa;

  const accionesPermitidas = obtenerAccionesPermitidas(mesa.estado, rolUsuario);

  const accionSugerida = obtenerAccionSugerida(accionesPermitidas);

  await prisma.$transaction(async (tx) => {
    await tx.etiquetaNfc.update({
      where: {
        id: etiqueta.id,
      },

      data: {
        ultimoUsoEn: new Date(),
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        mesaId: mesa.id,

        usuarioId,

        tipo: "NFC_SCANNED",

        descripcion: `Etiqueta NFC escaneada en la mesa ${mesa.numero}.`,

        origen: "ANDROID",

        metadata: {
          metodo: "NFC",

          etiquetaNfcId: etiqueta.id,

          estadoMesa: mesa.estado,

          accionSugerida: accionSugerida?.codigo ?? null,
        },
      },
    });
  });

  return {
    mesa: convertirMesa(mesa),

    accionesPermitidas,

    accionSugerida,

    lectura: {
      metodo: "NFC",

      fechaHora: new Date(),
    },
  };
}

export async function prepararVinculacionNfc(restauranteId, mesaId) {
  const mesa = await prisma.mesa.findFirst({
    where: {
      id: mesaId,

      restauranteId,

      activa: true,
    },

    include: {
      piso: {
        select: {
          id: true,

          nombre: true,
        },
      },
    },
  });

  if (!mesa) {
    throw crearErrorHttp("La mesa no existe o no está activa.", 404);
  }

  const token = generarTokenNfc();

  const tokenHash = obtenerHashToken(token);

  /*
   * La etiqueta se crea INACTIVA.
   *
   * No reemplazamos la etiqueta actual todavía.
   *
   * Sólo se activa cuando Android confirma que
   * consiguió escribir físicamente la NTAG213.
   */
  const etiqueta = await prisma.etiquetaNfc.create({
    data: {
      restauranteId,

      mesaId: mesa.id,

      tokenHash,

      tipo: "TABLE_OPERATION",

      activa: false,
    },
  });

  return {
    etiquetaId: etiqueta.id,

    /*
     * El token original se devuelve una única vez
     * para poder escribir la etiqueta.
     *
     * PostgreSQL sólo conserva su SHA-256.
     */
    token,

    contenido: `v=1;t=${token}`,

    mesa: {
      id: mesa.id,

      numero: mesa.numero,

      piso: {
        id: mesa.piso.id,

        nombre: mesa.piso.nombre,
      },
    },
  };
}

export async function confirmarVinculacionNfc(
  restauranteId,
  usuarioId,
  etiquetaId,
  token,
) {
  const tokenHash = obtenerHashToken(token);

  const etiqueta = await prisma.etiquetaNfc.findFirst({
    where: {
      id: etiquetaId,

      restauranteId,

      tokenHash,

      tipo: "TABLE_OPERATION",
    },

    include: {
      mesa: {
        include: {
          piso: true,
        },
      },
    },
  });

  if (!etiqueta || !etiqueta.mesa) {
    throw crearErrorHttp("La vinculación NFC no es válida.", 404);
  }

  /*
   * Si ya estaba activa, devolvemos éxito.
   *
   * Esto vuelve el endpoint idempotente frente
   * a una repetición accidental de la petición.
   */
  if (etiqueta.activa) {
    return {
      vinculada: true,

      etiquetaId: etiqueta.id,

      mesa: {
        id: etiqueta.mesa.id,

        numero: etiqueta.mesa.numero,
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    /*
     * Desactivamos cualquier etiqueta operacional
     * anterior vinculada a esa mesa.
     *
     * Así sólo existe una etiqueta principal activa.
     */
    await tx.etiquetaNfc.updateMany({
      where: {
        restauranteId,

        mesaId: etiqueta.mesaId,

        tipo: "TABLE_OPERATION",

        activa: true,

        id: {
          not: etiqueta.id,
        },
      },

      data: {
        activa: false,
      },
    });

    await tx.etiquetaNfc.update({
      where: {
        id: etiqueta.id,
      },

      data: {
        activa: true,
      },
    });

    await tx.evento.create({
      data: {
        restauranteId,

        usuarioId,

        mesaId: etiqueta.mesaId,

        tipo: "NFC_TAG_LINKED",

        descripcion: `Etiqueta NFC vinculada a la mesa ${etiqueta.mesa.numero}.`,

        origen: "ANDROID",

        metadata: {
          etiquetaNfcId: etiqueta.id,

          metodo: "NFC_WRITE",
        },
      },
    });
  });

  return {
    vinculada: true,

    etiquetaId: etiqueta.id,

    mesa: {
      id: etiqueta.mesa.id,

      numero: etiqueta.mesa.numero,

      piso: {
        id: etiqueta.mesa.piso.id,

        nombre: etiqueta.mesa.piso.nombre,
      },
    },
  };
}

export async function cancelarVinculacionNfc(restauranteId, etiquetaId) {
  /*
   * Sólo permitimos borrar una vinculación
   * que todavía NO haya sido confirmada.
   */
  const resultado = await prisma.etiquetaNfc.deleteMany({
    where: {
      id: etiquetaId,

      restauranteId,

      activa: false,

      tipo: "TABLE_OPERATION",
    },
  });

  return {
    cancelada: resultado.count > 0,
  };
}
