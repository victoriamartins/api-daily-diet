import { FastifyInstance } from 'fastify'
import { object, z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'

export async function mealRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId
    if (!sessionId) {
      return reply.status(401).send({
        error: 'Unauthorized',
      })
    }

    const meals = await knex('meals').select('*').where('session_id', sessionId)
    return meals
  })

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      description: z.string(),
      mealAt: z.string(),
      onDiet: z.coerce.boolean(),
    })
    const { name, description, mealAt, onDiet } = bodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId // user config
    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days (clean code!)
      })
    }
    await knex('meals').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      description,
      meal_at: mealAt,
      on_diet: onDiet,
    })

    return reply.status(201).send()
  })
}
