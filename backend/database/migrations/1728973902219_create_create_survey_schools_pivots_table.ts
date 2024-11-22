import { BaseSchema } from '@adonisjs/lucid/schema'

export default class SurveySchoolsPivot extends BaseSchema {
  protected tableName = 'survey_schools'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary key
      table.integer('survey_id').unsigned().references('id').inTable('surveys').onDelete('CASCADE') // Foreign key to surveys
      table.integer('school_id').unsigned().references('id').inTable('schools').onDelete('CASCADE') // Foreign key to schools

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now()) // Optional: track when the relationship was created
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now()) // Optional: track when the relationship was updated
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
