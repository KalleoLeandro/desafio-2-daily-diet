import fastify from "fastify";
import cookie from '@fastify/cookie';
import { env } from "./env";
import { usersRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";


export const server = fastify();

server.register(cookie);

server.register(usersRoutes,{
    prefix: 'users'
});

server.register(mealsRoutes,{
    prefix: 'meals'
});