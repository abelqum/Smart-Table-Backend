function obtenerRutaLimpia(req) {
  return req.originalUrl.split("?")[0];
}

function obtenerRecursosModificados(req) {
  const metodo = req.method;

  const ruta = obtenerRutaLimpia(req);

  const esMutacion = ["POST", "PATCH", "PUT", "DELETE"].includes(metodo);

  if (!esMutacion) {
    return [];
  }

  /*
   * Cambiar únicamente la contraseña no modifica
   * ningún dato visible del panel.
   */
  if (ruta === "/api/auth/me/contrasena") {
    return [];
  }

  /*
   * El usuario cambió nombre o correo.
   *
   * - su encabezado debe actualizarse
   * - el módulo Usuarios del administrador también
   */
  if (ruta === "/api/auth/me") {
    return ["sesion", "usuarios"];
  }

  /*
   * Administración de usuarios.
   *
   * Invalidamos también sesión.
   *
   * Esto tiene una ventaja importante:
   * si ADMIN desactiva una cuenta que actualmente
   * está conectada, ese usuario volverá a consultar
   * /auth/me y el backend podrá expulsarlo.
   */
  if (ruta.startsWith("/api/usuarios")) {
    return ["usuarios", "sesion"];
  }

  if (ruta.startsWith("/api/restaurante")) {
    return ["restaurante"];
  }

  if (ruta.startsWith("/api/pisos")) {
    return ["pisos", "mesas"];
  }

  /*
   * Cualquier cambio en mesas puede afectar:
   *
   * - plano
   * - dashboard
   * - historial
   * - lista de espera
   * - turno actual
   *
   * Por ejemplo, al asignar una mesa un turno
   * cambia WAITING -> SEATED.
   */
  if (ruta.startsWith("/api/mesas")) {
    return ["mesas", "turnos", "turnoActual", "dashboard", "eventos"];
  }

  /*
   * Crear, editar, llamar o cancelar un turno
   * afecta varias pantallas.
   */
  if (ruta.startsWith("/api/turnos")) {
    return ["turnos", "turnoActual", "dashboard", "eventos"];
  }

  return [];
}

/**
 * Publica cambios por Socket.IO únicamente
 * DESPUÉS de que la petición HTTP finalizó correctamente.
 *
 * Esto evita avisar a los clientes cuando una operación
 * termina en 400, 401, 403, 404, 409 o 500.
 */
export function notificarCambiosRealtime(req, res, next) {
  res.on("finish", () => {
    /*
     * Sólo respuestas exitosas.
     */
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    /*
     * Las rutas protegidas dejan aquí al
     * usuario autenticado.
     */
    const restauranteId = req.usuario?.restauranteId;

    if (!restauranteId) {
      return;
    }

    const recursos = obtenerRecursosModificados(req);

    if (recursos.length === 0) {
      return;
    }

    const io = req.app.get("io");

    if (!io) {
      return;
    }

    io.to(`restaurante:${restauranteId}`).emit("smarttable:actualizacion", {
      recursos,

      metodo: req.method,

      ruta: obtenerRutaLimpia(req),

      usuarioId: req.usuario.id,

      fechaHora: new Date().toISOString(),
    });
  });

  return next();
}
