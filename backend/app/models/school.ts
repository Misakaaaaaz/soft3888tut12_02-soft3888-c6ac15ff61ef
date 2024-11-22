import { DateTime } from 'luxon'
import { column, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Survey from './survey.js'
import ManagedModel from './managed_model.js'

export default class School extends ManagedModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare adminUserId: number

  @belongsTo(() => User, {
    foreignKey: 'adminUserId',
  })
  declare adminUser: BelongsTo<typeof User>

  // Define the many-to-many relationship with Survey
  @manyToMany(() => Survey, {
    pivotTable: 'survey_schools', // Define the pivot table
    localKey: 'id', // School's local key
    pivotForeignKey: 'school_id', // The foreign key for School in the pivot table
    relatedKey: 'id', // Survey's local key
    pivotRelatedForeignKey: 'survey_id', // The foreign key for Survey in the pivot table
    pivotTimestamps: true, // Store timestamps in the pivot table
  })
  public surveys!: ManyToMany<typeof Survey>
}
