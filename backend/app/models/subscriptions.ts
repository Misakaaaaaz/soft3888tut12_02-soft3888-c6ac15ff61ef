import { DateTime } from 'luxon'
import { BaseModel, column} from '@adonisjs/lucid/orm'
// import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Subscriptions extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare channel_id: number

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

}
