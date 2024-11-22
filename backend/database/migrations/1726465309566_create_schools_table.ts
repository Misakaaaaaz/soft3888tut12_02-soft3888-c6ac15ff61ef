import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.json('permission_metadata').notNullable().defaultTo(JSON.stringify([]))
      table.integer('owned_by_id').unsigned().references('users.id').onDelete('CASCADE')

      table.string('name').notNullable()

      // Making admin_user_id nullable
      table
        .integer('admin_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
