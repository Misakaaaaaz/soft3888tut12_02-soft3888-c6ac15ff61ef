import { DateTime } from 'luxon'
import { column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import ManagedModel from './managed_model.js'

export default class Survey extends ManagedModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare level: number

  // @manyToMany(() => School)
  // declare school: ManyToMany<typeof School>

  // Define the many-to-many relationship with School

  @manyToMany(() => School, {
    pivotTable: 'survey_schools', // Define the pivot table
    localKey: 'id', // Survey's local key
    pivotForeignKey: 'survey_id', // The foreign key for Survey in the pivot table
    relatedKey: 'id', // School's local key
    pivotRelatedForeignKey: 'school_id', // The foreign key for School in the pivot table
    pivotTimestamps: true, // Store timestamps in the pivot table
  })
  public schools!: ManyToMany<typeof School>
}
