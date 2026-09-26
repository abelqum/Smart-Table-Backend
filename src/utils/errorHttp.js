export function crearErrorHttp(mensaje, status = 400) {
  const error = new Error(mensaje);

  error.status = status;

  return error;
}
