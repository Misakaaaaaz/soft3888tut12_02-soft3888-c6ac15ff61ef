import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateSosMessagesTable extends BaseSchema {
  protected tableName = 'sos_messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('alert_date').defaultTo(this.now()).notNullable()
      table.string('name').notNullable()
      table.string('email').notNullable()
      table.string('school').notNullable()
      table.string('contact').notNullable()
      table.string('batch').notNullable()  
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
