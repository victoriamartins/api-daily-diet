import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { checkSessionIdCookie } from '../middlewares/check-session-id'

export async function mealRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdCookie],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals')
        .select('*')
        .where('session_id', sessionId)
      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdCookie],
    },
    async (request) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })
      const { sessionId } = request.cookies
      const { id } = paramsSchema.parse(request.params)

      const meal = await knex('meals')
        .select('*')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return { meal }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdCookie],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const countSchema = z.object({
        count: z.number().default(0),
      }) // criado para dar "inteligencia" ao counter

      const countOffDiet = await knex('meals')
        .count('* as count')
        .where('on_diet', '0')
        .andWhere('session_id', sessionId)
        .first()

      const countOnDiet = await knex('meals')
        .count('* as count')
        .where('on_diet', '1')
        .andWhere('session_id', sessionId)
        .first()

      const countAll = await knex('meals')
        .count('* as count')
        .where('session_id', sessionId)
        .first()

      // TODO: write a query of on_diet=1 best streak

      return {
        mealsOffDiet: countSchema.parse(countOffDiet).count,
        mealsOnDiet: countSchema.parse(countOnDiet).count,
        allMeals: countSchema.parse(countAll).count,
      }
    },
  )

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

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdCookie],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const paramsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = paramsSchema.parse(request.params)

      const responseStatus = await knex('meals')
        .delete('*')
        .where('id', id)
        .andWhere('session_id', sessionId)

      return responseStatus
        ? reply.status(200).send('Meal deleted')
        : reply.status(404).send('Meal not found')
    },
  )
}
