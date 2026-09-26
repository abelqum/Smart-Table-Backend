import express from "express";
import cors from "cors";

import { entorno } from "./config/entorno.js";

import rutasApi from "./routes/index.js";

import {
  manejarError,
  manejarRutaNoEncontrada,
} from "./middlewares/errores.js";

const app = express();

/*
 * Evitamos exponer innecesariamente
 * que utilizamos Express.
 */
app.disable("x-powered-by");

/*
 * Durante desarrollo:
 *
 * Next.js:
 * http://localhost:3000
 *
 * Express:
 * http://localhost:4000
 */
app.use(
  cors({
    origin: entorno.frontendUrl,

    credentials: true,
  }),
);

/*
 * Permite que Express interprete
 * cuerpos JSON enviados por los clientes.
 */
app.use(
  express.json({
    limit: "1mb",
  }),
);

/*
 * Toda nuestra API estará debajo de /api.
 */
app.use("/api", rutasApi);

/*
 * Estos middlewares deben quedar después
 * de las rutas.
 */
app.use(manejarRutaNoEncontrada);

app.use(manejarError);

export default app;
