import { BaseSchema } from '@adonisjs/lucid/schema'
// generate default data for the application
import User from '#models/user'
import { Profile, Access } from '#models/profile_access_enums'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.enum('profile', ['Admin', 'Parent', 'Teacher', 'Student', 'User']).notNullable()
      table.enum('access', ['Full', 'High', 'Medium', 'Low']).notNullable()
      table.json('permission_metadata').notNullable().defaultTo(JSON.stringify([]))
      table.string('profile_image').nullable()

      table.integer('user_school_id').unsigned().references('schools.id').onDelete('CASCADE')
      table.integer('related_user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('owned_by_id').unsigned().references('users.id').onDelete('CASCADE')
      table.json('channel_action_metadata').notNullable().defaultTo(JSON.stringify({}));
    })

    // Create the default admin user
    User.create(
      {
        "firstName": "admin",
        "email": "admin@test.gg",
        "password": "password",
        "profile": Profile.Admin,
        "access": Access.Full,
        "permissionMetadata": ["User.admin"],
        channelActionMetadata: {}
      }
    )

    User.create(
      {
        "firstName": "test",
        "lastName" : "user",
        "email": "user@test.gg",
        "password": "password",
        "profile": Profile.Student,
        "access": Access.Full,
        "permissionMetadata": ["User.student"],
        channelActionMetadata: {}
      }
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}