import { BaseSchema } from '@adonisjs/lucid/schema'
import Subscription from '#models/subscriptions'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('channel_id').unsigned().references('channels.id').onDelete('CASCADE')
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
    Subscription.create(
      {
        "id": 1,
        "user_id" : 2,
        "channel_id": 1
      }
    )
    Subscription.create(
      {
        "id": 2,
        "user_id" : 2,
        "channel_id": 2
      }
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}