import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { Access, Profile } from '#models/profile_access_enums'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      profile: faker.helpers.arrayElement(Object.values(Profile)),
      access: faker.helpers.arrayElement(Object.values(Access)),
      permissionNode: faker.lorem.words(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ownedById: undefined,
    }
  })
  .build()