import express from "express";

import cors from "cors";

import { entorno } from "./config/entorno.js";

import rutasApi from "./routes/index.js";

import {
  manejarError,
  manejarRutaNoEncontrada,
} from "./middlewares/errores.js";

import { notificarCambiosRealtime } from "./middlewares/realtime.js";

const app = express();

app.disable("x-powered-by");

/*
 * Durante desarrollo:
 *
 * Next.js:
 * http://localhost:3000
 *
 * Express / Socket.IO:
 * http://localhost:4000
 */
app.use(
  cors({
    origin: entorno.frontendUrl,

    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

/*
 * Registramos el listener ANTES de las rutas.
 *
 * Cuando la respuesta termine, el middleware
 * comprobará si fue una mutación exitosa y
 * notificará al resto de clientes.
 */
app.use(notificarCambiosRealtime);

/*
 * API REST.
 */
app.use("/api", rutasApi);

/*
 * Manejo de errores.
 */
app.use(manejarRutaNoEncontrada);

app.use(manejarError);

export default app;
