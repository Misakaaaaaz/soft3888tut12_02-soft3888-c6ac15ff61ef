import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateMoodsTable extends BaseSchema {
  protected tableName = 'moods' 

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at', { useTz: true }).notNullable() 
      table.timestamp('updated_at', { useTz: true }).notNullable() 
      table.json('permission_metadata').notNullable().defaultTo(JSON.stringify([])) 
      table.integer('owned_by_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('name').notNullable() 
      table.string('image_url').notNullable(); 

    })
  }

  public async down() {
    this.schema.dropTable(this.tableName) 
  }
}

