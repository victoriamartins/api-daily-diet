import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('🚀 Daily diet server running')
  })
  .catch((e) => {
    console.log(`🟥 Daily diet server broke: ${e}`)
  })
