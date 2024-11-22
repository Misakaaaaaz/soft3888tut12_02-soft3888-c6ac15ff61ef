import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { GroupFactory } from '#database/factories/group_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { Access, Profile } from '#models/profile_access_enums'
import PermissionService from '#services/permission_service'

test.group('Permissions', (suite) => {
  suite.each.setup(() => testUtils.db().withGlobalTransaction())

  async function getMockAdminUser() {
    return await User.create({
      email: 'admin@example.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
      permissionNode: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      ownedById: 1,
    })
  }

  test('can update user permissions', async ({ client }) => {
    const admin = await getMockAdminUser()
    const user = await UserFactory.create()
    const permissions = ['+user.read', '-user.write']

    const response = await client.put(`/users/${user.id}/permissions`)
      .json({ permissions })
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({ permissions })
  })

  test('can get permission nodes', async ({ client }) => {
    const admin = await getMockAdminUser()

    const response = await client.get('/permissions/nodes').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(PermissionService.getPermissionNodes())
  })

  test('can get user effective permissions', async ({ client }) => {
    const admin = await getMockAdminUser()
    const user = await UserFactory.create()
    const group = await GroupFactory.create()
    const permissions = ['user.read', 'user.write']
    group.merge({ permissions })
    await group.save()
    user.merge({ profile: group.name })
    await user.save()

    const response = await client.get(`/users/${user.id}/permissions`).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(['user.read', 'user.write'])
  })

  test('can get group permissions', async ({ client }) => {
    const admin = await getMockAdminUser()
    const group = await GroupFactory.create()
    const permissions = ['group.read', 'group.write']
    group.permissions = permissions
    await group.save()

    const response = await client.get('/permissions/group')
      .qs({ profile: group.name })
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(['group.read', 'group.write'])
  })

  test('returns empty array for non-existent group permissions', async ({ client }) => {
    const admin = await getMockAdminUser()

    const response = await client.get('/permissions/group')
      .qs({ profile: 'non-existent-group' })
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains([])
  })
})
