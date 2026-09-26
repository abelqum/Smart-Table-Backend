export function validarCuerpo(esquema) {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req.body);

    if (!resultado.success) {
      const primerError = resultado.error.issues[0];

      return res.status(400).json({
        mensaje: primerError?.message ?? "Los datos enviados no son válidos.",
      });
    }

    /*
     * Sustituimos req.body por la información
     * ya validada y normalizada por Zod.
     */
    req.body = resultado.data;

    return next();
  };
}
