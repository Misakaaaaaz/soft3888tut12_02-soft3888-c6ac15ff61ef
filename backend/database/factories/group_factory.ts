import factory from '@adonisjs/lucid/factories'
import Group from '#models/group'
import { Profile } from '#models/profile_access_enums'

export const GroupFactory = factory
  .define(Group, async ({ faker }) => {
    return {
      name: faker.helpers.arrayElement(Object.values(Profile).filter(it => it !== Profile.Admin)),
      permissions: faker.lorem.words(10).split(' '),
    }
  })
  .build()
