import { z } from "zod";

const rolesUsuario = ["ADMIN", "HOSTESS", "WAITER", "CLEANING"];

export const esquemaCrearUsuario = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe contener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  correo: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresa un correo electrónico válido."),

  contrasena: z
    .string()
    .min(6, "La contraseña debe contener al menos 6 caracteres.")
    .max(100, "La contraseña es demasiado larga."),

  rol: z.enum(rolesUsuario, {
    error: "Selecciona un rol válido.",
  }),
});

export const esquemaActualizarUsuario = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre debe contener al menos 2 caracteres.")
      .max(100)
      .optional(),

    correo: z
      .string()
      .trim()
      .toLowerCase()
      .email("Ingresa un correo electrónico válido.")
      .optional(),

    rol: z
      .enum(rolesUsuario, {
        error: "Selecciona un rol válido.",
      })
      .optional(),

    activo: z.boolean().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Debes enviar al menos un dato para actualizar.",
  });

export const esquemaRestablecerContrasena = z.object({
  nuevaContrasena: z
    .string()
    .min(6, "La nueva contraseña debe contener al menos 6 caracteres.")
    .max(100),
});
