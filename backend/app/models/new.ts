import { DateTime } from 'luxon'
import { column, manyToMany } from '@adonisjs/lucid/orm'
import School from './school.js'
import Channel from './channel.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import ManagedModel from './managed_model.js'

export default class New extends ManagedModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare title: string

  @column()
  declare url: string

  @manyToMany(() => School, {
    pivotTable: 'news_schools',
    localKey: 'id', 
    pivotForeignKey: 'news_id',
    relatedKey: 'id', 
    pivotRelatedForeignKey: 'school_id', 
    pivotTimestamps: true, 
  })
  public schools!: ManyToMany<typeof School>

  @column()
  declare date: string;

  @manyToMany(() => Channel, {pivotTable: 'channel_news',})
  declare channels: ManyToMany<typeof Channel>
}