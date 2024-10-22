import { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { knex } from "../database";
import { z } from 'zod';
import { randomUUID } from 'crypto';


export async function usersRoutes(server: FastifyInstance) {

    server.post('/', async (request, response) => {

        const createUserBodySchema = z.object({
            name: z.string()
        });

        const { name } = createUserBodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;
        
        if (!sessionId) {
            sessionId = randomUUID()

            response.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 20 // 20 minutes
            });
        }

        await knex('users').insert({
            id: randomUUID(),
            name,
            session_id: sessionId
        });

        return response.status(201).send();
    });

    server.get('/', { preHandler: [checkSessionIdExists] }, async (request, response) => {

        const { sessionId } = request.cookies;

        const users = await knex('users').where('session_id', sessionId).select();
        return { users };
    });
    
    server.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
        const { sessionId } = request.cookies;
        
        const getUserParamSchema = z.object({
            id: z.string().uuid()
        });

        const { id } = getUserParamSchema.parse(request.params);

        const user = await knex('users').where({ session_id: sessionId, id }).first();

        return { user };
    });
}