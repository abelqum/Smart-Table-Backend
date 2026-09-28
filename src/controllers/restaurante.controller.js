import {
  actualizarRestaurante as actualizarRestauranteServicio,
  obtenerRestaurante as obtenerRestauranteServicio,
} from "../services/restaurante.service.js";

export async function obtenerRestaurante(req, res, next) {
  try {
    const restaurante = await obtenerRestauranteServicio(
      req.usuario.restauranteId,
    );

    return res.json(restaurante);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarRestaurante(req, res, next) {
  try {
    const restaurante = await actualizarRestauranteServicio(
      req.usuario.restauranteId,
      req.body,
    );

    return res.json(restaurante);
  } catch (error) {
    return next(error);
  }
}
