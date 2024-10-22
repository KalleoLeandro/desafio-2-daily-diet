import { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { knex } from "../database";
import { z } from 'zod';
import { randomUUID } from 'crypto';

export async function mealsRoutes(server: FastifyInstance) {

    server.post('/', async (request, response) => {

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dietValid: z.boolean(),
            id_user: z.string()
        });

        const { name, description, dietValid, id_user } = createMealBodySchema.parse(request.body);

        await knex('meals').insert({
            id: randomUUID(),
            id_user,
            name,
            description,
            created_at: new Date().toString(),
            dietValid
        });

        return response.status(201).send();
    });

    server.get('/resume', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const { sessionId } = request.cookies;

        const user = await knex('users')
            .where('session_id', sessionId)
            .select('id')
            .first();

        if (user) {
            const totalMeals = await knex('meals').count('id', { as: 'id' }).where('id_user', user.id).first();
            const inDietMeals = await knex('meals').count('id', { as: 'id' }).where('id_user', user.id).andWhere('meals.dietValid', true).first();

            const streakMeals = await knex('meals')
                .join('users', 'meals.id_user', 'users.id')
                .where('users.session_id', sessionId)
                .select('dietValid');

            let maxStreak = 0;
            let currentStreak = 0;
            streakMeals.forEach((meal) => {
                if (meal.dietValid) {
                    currentStreak++;
                    if (currentStreak > maxStreak) {
                        maxStreak = currentStreak;
                    }
                } else {
                    currentStreak = 0;
                }
            });
            return { totalMeals, inDietMeals, maxStreak }
        } else {
            return response.status(403).send();
        }
    });

    server.get('/', { preHandler: [checkSessionIdExists] }, async (request, response) => {

        const { sessionId } = request.cookies;

        const meals = await knex('meals')
            .join('users', 'meals.id_user', 'users.id')
            .where('users.session_id', sessionId)
            .select('meals.*');

        return { meals };
    });

    server.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {

        const createMealBodySchema = z.object({
            id: z.string().uuid()
        })

        const { id } = createMealBodySchema.parse(request.params);

        const { sessionId } = request.cookies;

        const meal = await knex('meals')
            .join('users', 'meals.id_user', 'users.id')
            .where('users.session_id', sessionId)
            .andWhere('meals.id', id)
            .select('meals.*');

        return { meal };
    });

    server.put('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            dietValid: z.boolean()
        });

        const createMealCookieSchema = z.object({
            sessionId: z.string()
        });

        const createIdMealSchema = z.object({
            id: z.string()
        });

        const { name, description, dietValid } = createMealBodySchema.parse(request.body);
        const { id } = createIdMealSchema.parse(request.params);
        const { sessionId } = createMealCookieSchema.parse(request.cookies);

        const user = await knex('users')
            .where('session_id', sessionId)
            .select('id')
            .first();

        if (user) {
            await knex('meals')
                .where('meals.id', id)
                .update({
                    name,
                    description,
                    created_at: new Date().toString(),
                    dietValid
                });
        }

        return response.status(200).send();
    });

    server.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const createMealCookieSchema = z.object({
            sessionId: z.string()
        });

        const createIdMealSchema = z.object({
            id: z.string()
        });

        const { id } = createIdMealSchema.parse(request.params);
        const { sessionId } = createMealCookieSchema.parse(request.cookies);

        const user = await knex('users')
            .where('session_id', sessionId)
            .select('id')
            .first();

        if (user) {
            await knex('meals')
                .where('meals.id', id)
                .andWhere('meals.id_user', user.id)
                .delete();
        }
        return response.status(204).send();
    });

}