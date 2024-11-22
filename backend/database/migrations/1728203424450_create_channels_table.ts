import { BaseSchema } from '@adonisjs/lucid/schema'
import Channel from '#models/channel'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
    Channel.create(
      {
        "id": 1,
        "title" : "channel 1"
      }
    )

    Channel.create(
      {
        "id": 2,
        "title" : "channel 2"
      }
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}