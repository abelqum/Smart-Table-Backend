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

  /*
   * Errores comunes de Prisma.
   */
  if (error.code === "P2002") {
    return res.status(409).json({
      mensaje: "Ya existe un registro con esos datos.",
    });
  }

  if (error.code === "P2003") {
    return res.status(409).json({
      mensaje:
        "No se puede completar la operación porque existen registros relacionados.",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      mensaje: "El registro solicitado no existe.",
    });
  }

  const estado = error.status ?? error.statusCode ?? 500;

  const mensaje =
    estado >= 500 ? "Ocurrió un error interno en el servidor." : error.message;

  return res.status(estado).json({
    mensaje,
  });
}
