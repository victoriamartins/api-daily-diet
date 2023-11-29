import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      session_id: string
      name: string
      description: string
      meal_at: string
      on_diet: boolean
    }
  }
}
