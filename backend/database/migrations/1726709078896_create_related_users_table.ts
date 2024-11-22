import { BaseSchema } from '@adonisjs/lucid/schema'


export default class RelatedUsers extends BaseSchema {
  protected tableName = 'related_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('related_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')  
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}