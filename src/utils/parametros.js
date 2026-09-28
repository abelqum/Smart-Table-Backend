import { crearErrorHttp } from "./errorHttp.js";

export function obtenerIdNumerico(valor, nombre = "id") {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw crearErrorHttp(`El parámetro ${nombre} no es válido.`, 400);
  }

  return id;
}
