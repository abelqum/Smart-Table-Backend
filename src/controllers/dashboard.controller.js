import { obtenerResumenDashboard as obtenerResumenDashboardServicio } from "../services/dashboard.service.js";

export async function obtenerResumenDashboard(req, res, next) {
  try {
    const resumen = await obtenerResumenDashboardServicio(
      req.usuario.restauranteId,
    );

    return res.json(resumen);
  } catch (error) {
    return next(error);
  }
}
