import { z } from "zod";

const esquemaToken = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{32}$/, "El token NFC no tiene un formato válido.")
  .transform((valor) => valor.toLowerCase());

export const esquemaResolverNfc = z.object({
  token: esquemaToken,
});

export const esquemaPrepararVinculacionNfc = z.object({
  mesaId: z.number().int().positive(),
});

export const esquemaConfirmarVinculacionNfc = z.object({
  etiquetaId: z.number().int().positive(),

  token: esquemaToken,
});

export const esquemaCancelarVinculacionNfc = z.object({
  etiquetaId: z.number().int().positive(),
});
