import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import News from './new.js'
import User from './user.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => News, {pivotTable: 'channel_news',})
  declare news: ManyToMany<typeof News>

  @manyToMany(() => User, {
    pivotTable: 'subscriptions',
    // pivotForeignKey: 'channel_id',
    // pivotRelatedForeignKey: 'user_id'
  })
  declare users: ManyToMany<typeof User>
}
