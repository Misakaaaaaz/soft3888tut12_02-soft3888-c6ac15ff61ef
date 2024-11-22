import { BaseSchema } from '@adonisjs/lucid/schema'
import Group from '../../app/models/group.js'

export default class extends BaseSchema {
  protected tableName = 'groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('name').notNullable()
      table.json('permissions').notNullable().defaultTo(JSON.stringify([]))
    })

    // Create the default Admin group
    Group.create(
      {
        "name": "Admin",
        "permissions": ["User.admin"]
      }
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}