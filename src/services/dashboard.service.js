import { prisma } from "../config/prisma.js";

export async function obtenerResumenDashboard(restauranteId) {
  const [
    totalMesas,
    disponibles,
    ocupadas,
    pendientesLimpieza,
    enLimpieza,
    turnosEsperando,
  ] = await Promise.all([
    prisma.mesa.count({
      where: {
        restauranteId,
        activa: true,
      },
    }),

    prisma.mesa.count({
      where: {
        restauranteId,
        activa: true,
        estado: "AVAILABLE",
      },
    }),

    prisma.mesa.count({
      where: {
        restauranteId,
        activa: true,
        estado: "OCCUPIED",
      },
    }),

    prisma.mesa.count({
      where: {
        restauranteId,
        activa: true,
        estado: "DIRTY",
      },
    }),

    prisma.mesa.count({
      where: {
        restauranteId,
        activa: true,
        estado: "CLEANING",
      },
    }),

    prisma.turno.count({
      where: {
        restauranteId,
        estado: "WAITING",
      },
    }),
  ]);

  const porcentajeOcupacion =
    totalMesas === 0 ? 0 : Math.round((ocupadas / totalMesas) * 100);

  return {
    totalMesas,
    disponibles,
    ocupadas,
    pendientesLimpieza,
    enLimpieza,
    turnosEsperando,
    porcentajeOcupacion,
  };
}
