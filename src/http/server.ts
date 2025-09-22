import Fastify from "fastify";
import session from "@fastify/session";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import config from "../../config.json" with { type: "json" };
import * as log from "../utils/logger.js";
import "dotenv/config";
//import routes from "./router.js";
import autoload from "@fastify/autoload";
import path from "path";
import { SessionUser } from "../types.js";
const __dirname = import.meta.dirname;

const app = Fastify()

if (!process.env.SESSION_SECRET) throw Error("bru");

declare module "fastify" {
  interface Session {
    user: SessionUser
  }
}

app.register(cookie);
app.register(cors, {
  origin: config.frontend_url,
  optionsSuccessStatus: 200
})
app.register(session, { secret: process.env.SESSION_SECRET, cookie: { secure: false } });
app.register(autoload, {
  dir: path.join(__dirname, "routes"),
  routeParams: true
})

//if (app.get('env') === 'production') {
//  app.set('trust proxy', 1) // trust first proxy
//  sess.cookie.secure = true // serve secure cookies
//}

export function listen() {
  app.listen({ host: "0.0.0.0", port: config.apiServerPort }, (err, address) => {
    if (err) { throw err; }
    log.success(`API Server listening at ${address}.`);
  });
}