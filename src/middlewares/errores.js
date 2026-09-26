export function manejarRutaNoEncontrada(req, res) {
  return res.status(404).json({
    mensaje: `No existe el recurso ${req.method} ${req.originalUrl}.`,
  });
}

export function manejarError(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const estado = error.status ?? error.statusCode ?? 500;

  const mensaje =
    estado >= 500 ? "Ocurrió un error interno en el servidor." : error.message;

  return res.status(estado).json({
    mensaje,
  });
}
