import { DateTime } from 'luxon'
import {
  column,
  belongsTo,
} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from './user.js' 
import ManagedModel from './managed_model.js'

export default class Event extends ManagedModel {
  @column({ isPrimary: true })
  public declare id: number

  @column.dateTime({ autoCreate: true })
  public declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public declare updatedAt: DateTime

  @column()
  public declare title: string

  @column()
  public declare description: string

  @column.dateTime()
  public declare startDate: DateTime

  @column.dateTime()
  public declare endDate: DateTime

  @column()
  public declare permissionMetadata: any

  @column()
  public declare ownedById: number

  @belongsTo(() => User, {
    foreignKey: 'ownedById',
  })
  public declare owner: BelongsTo<typeof User>
}
