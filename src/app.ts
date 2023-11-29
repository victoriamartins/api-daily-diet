import fastify from 'fastify'

export const app = fastify()

app.get('/', () => {
  return 'hi!'
})
