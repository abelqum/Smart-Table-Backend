import { obtenerEventos as obtenerEventosServicio } from "../services/eventos.service.js";

export async function obtenerEventos(req, res, next) {
  try {
    const eventos = await obtenerEventosServicio(req.usuario.restauranteId);

    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
}
