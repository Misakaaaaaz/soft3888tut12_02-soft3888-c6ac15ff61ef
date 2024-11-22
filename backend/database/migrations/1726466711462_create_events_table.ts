import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')  

      table.timestamp('created_at')  
      table.timestamp('updated_at') 
      table.json('permission_metadata').notNullable().defaultTo(JSON.stringify([]))
      table.integer('owned_by_id').unsigned().references('users.id').onDelete('CASCADE') 

      table.string('title').notNullable()  
      table.string('description', 254).notNullable()  
      table.dateTime('start_date').notNullable()  
      table.dateTime('end_date').notNullable() 
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
