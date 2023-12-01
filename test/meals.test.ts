import request from 'supertest'
import { app } from '../src/app'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'

describe('meal routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it.skip('should create a new meal', async () => {
    const reply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })

    expect(reply.statusCode).toEqual(201)
  })

  it.skip('should NOT create a new meal', async () => {
    const reply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      onDiet: true,
    })

    expect(reply.statusCode).toEqual(500)
  })

  it.skip('should list all meals', async () => {
    const createMealReply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })
    const userCookie = createMealReply.get('Set-Cookie')

    await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Huge hamburguer',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: false,
    })

    const listMealsReply = await request(app.server)
      .get('/meal')
      .set('Cookie', userCookie)
      .expect(200)

    expect(listMealsReply.body.meals)
  })

  it.skip('should get a specific meal', async () => {
    const createMealReply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })
    const userCookie = createMealReply.get('Set-Cookie')

    const listMealsReply = await request(app.server)
      .get('/meal')
      .set('Cookie', userCookie)
      .expect(200)
    const mealId = listMealsReply.body.meals[0].id

    const getASingleMeal = await request(app.server)
      .get(`/meal/${mealId}`)
      .set('Cookie', userCookie)
      .expect(200)

    expect(getASingleMeal.body.meal).toEqual(
      expect.objectContaining({
        name: 'Testing this meal',
        description: 'Rice, beans, and chicken wings',
        meal_at: '2023-11-30T18:38:00.000Z',
        on_diet: 1,
      }),
    )
  })

  it.skip('should get the users summary', async () => {
    const createMealReply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })
    const userCookie = createMealReply.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Testing this meal',
        description: 'Rice, beans, and chicken wings',
        mealAt: '2023-11-30T18:38:00.000Z',
        onDiet: false,
      })
      .set('Cookie', userCookie)
    await request(app.server)
      .post('/meal')
      .send({
        name: 'Testing this meal',
        description: 'Rice, beans, and chicken wings',
        mealAt: '2023-11-30T18:38:00.000Z',
        onDiet: false,
      })
      .set('Cookie', userCookie)

    const summaryReply = await request(app.server)
      .get('/meal/summary')
      .set('Cookie', userCookie)

    expect(summaryReply.body).toEqual(
      expect.objectContaining({
        mealsOffDiet: 2,
        mealsOnDiet: 1,
        allMeals: 3,
        streak: 1,
      }),
    )
  })

  it.skip('should delete a meal', async () => {
    const reply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })
    const userCookie = reply.get('Set-Cookie')

    const listMealsReply = await request(app.server)
      .get('/meal')
      .set('Cookie', userCookie)
      .expect(200)
    const mealId = listMealsReply.body.meals[0].id

    const deleteMealReply = await request(app.server)
      .delete(`/meal/${mealId}`)
      .set('Cookie', userCookie)

    expect(deleteMealReply.statusCode).toEqual(200)
  })

  it.skip('should NOT delete a meal', async () => {
    const reply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })
    const userCookie = reply.get('Set-Cookie')

    const listMealsReply = await request(app.server)
      .get('/meal')
      .set('Cookie', userCookie)
      .expect(200)
    const mealId = listMealsReply.body.meals[0].id

    await request(app.server)
      .delete(`/meal/${mealId}`)
      .set('Cookie', userCookie)

    const deleteMealReply = await request(app.server)
      .delete(`/meal/${mealId}`)
      .set('Cookie', userCookie)

    expect(deleteMealReply.statusCode).toEqual(404)
  })

  it('should update a meal', async () => {
    const createMealReply = await request(app.server).post('/meal').send({
      name: 'Testing this meal',
      description: 'Rice, beans, and chicken wings',
      mealAt: '2023-11-30T18:38:00.000Z',
      onDiet: true,
    })
    const userCookie = createMealReply.get('Set-Cookie')

    const listMealsReply = await request(app.server)
      .get('/meal')
      .set('Cookie', userCookie)
      .expect(200)
    const mealId = listMealsReply.body.meals[0].id

    await request(app.server)
      .put(`/meal/${mealId}`)
      .send({
        name: 'Updated Meal',
        description: 'Cinnamon Roll',
      })
      .set('Cookie', userCookie)
      .expect(200)

    const updatedMeal = await request(app.server)
      .get(`/meal/${mealId}`)
      .set('Cookie', userCookie)
      .expect(200)

    console.log(updatedMeal)

    expect(updatedMeal.body.meal).toEqual(
      expect.objectContaining({
        name: 'Updated Meal',
        description: 'Cinnamon Roll',
      }),
    )
  })
})
