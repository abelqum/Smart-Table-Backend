import {
  resolverNfc as resolverNfcServicio,
  prepararVinculacionNfc as prepararVinculacionNfcServicio,
  confirmarVinculacionNfc as confirmarVinculacionNfcServicio,
  cancelarVinculacionNfc as cancelarVinculacionNfcServicio,
} from "../services/nfc.service.js";

export async function resolverNfc(req, res, next) {
  try {
    const resultado = await resolverNfcServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      req.usuario.rol,
      req.body.token,
    );

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}

export async function prepararVinculacionNfc(req, res, next) {
  try {
    const resultado = await prepararVinculacionNfcServicio(
      req.usuario.restauranteId,
      req.body.mesaId,
    );

    return res.status(201).json(resultado);
  } catch (error) {
    return next(error);
  }
}

export async function confirmarVinculacionNfc(req, res, next) {
  try {
    const resultado = await confirmarVinculacionNfcServicio(
      req.usuario.restauranteId,
      req.usuario.id,
      req.body.etiquetaId,
      req.body.token,
    );

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}

export async function cancelarVinculacionNfc(req, res, next) {
  try {
    const resultado = await cancelarVinculacionNfcServicio(
      req.usuario.restauranteId,
      req.body.etiquetaId,
    );

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
}
