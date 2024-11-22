import { test } from '@japa/runner'
import { GroupFactory } from '#database/factories/group_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Group from '#models/group'
import User from '#models/user'
import { Access, Profile } from '#models/profile_access_enums'

test.group('Groups', (suite) => {
  // !! IMPORTANT !!
  // Make sure this lifecycle hook is executed before any test
  // Otherwise, the database will not be reset and the tests will fail
  suite.each.setup(() => testUtils.db().withGlobalTransaction())

  async function getMockUser() {
    return await User.create({
      email: 'test@example.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
      permissionNode: 'user',
      firstName: 'Test',
      lastName: 'User',
      ownedById: 1,
    })
  }

  // Test index method
  test('can list groups', async ({ client }) => {
    const user = await getMockUser()
    const groups = await Group.all()
    await GroupFactory.createMany(3)
    
    const response = await client.get('/groups').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains({ meta: { total: groups.length + 3 } })
  })

  // Test store method
  test('can create a new group', async ({ client }) => {
    const user = await getMockUser()
    const groupData = {
      name: 'New Group',
      permissions: ['read', 'write']
    }
    
    const response = await client.post('/groups').json(groupData).loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains({ name: 'New Group' })
  })

  // Test show method
  test('can fetch a single group', async ({ client }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    
    const response = await client.get(`/groups/${group.id}`).loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains({ id: group.id, name: group.name })
  })

  // Test update method
  test('can update a group', async ({ client }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    const updatedData = {
      name: 'Updated Group Name',
      permissions: ['admin', 'user']
    }
    
    const response = await client.put(`/groups/${group.id}`).json(updatedData).loginAs(user)
  
    response.assertStatus(200)
    response.assertBodyContains({ name: 'Updated Group Name', permissions: ['admin', 'user'] })
  })

  // Test update method with invalid data
  test('cannot update a group with invalid data', async ({ client }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    const invalidData = {
      name: '',
      permissions: 'not an array'
    }
    
    const response = await client.put(`/groups/${group.id}`).json(invalidData).loginAs(user)
    
    response.assertStatus(400)
    response.assertBodyContains({ error: 'Name should not be empty' })
  }) 

  // Test update method with empty name
  test('cannot update a group with an empty name', async ({ client }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    const invalidData = {
      name: '',
      permissions: ['read', 'write']
    }
    
    const response = await client.put(`/groups/${group.id}`).json(invalidData).loginAs(user)
    
    response.assertStatus(400)
    response.assertBodyContains({ error: 'Name should not be empty' })
  })

  // Test update method with non-array permissions
  test('cannot update a group with non-array permissions', async ({ client }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    const invalidData = {
      name: 'Valid Name',
      permissions: 'invalid permissions'
    }
    
    const response = await client.put(`/groups/${group.id}`).json(invalidData).loginAs(user)
    
    response.assertStatus(400)
    response.assertBodyContains({ error: 'Permissions must be an array' })
  })

  // Test update method with invalid permissions format
  test('cannot update a group with invalid permissions format', async ({ client }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    const invalidData = {
      name: { invalid: 'object' },
      permissions: []
    }
    
    const response = await client.put(`/groups/${group.id}`).json(invalidData).loginAs(user)
    
    response.assertStatus(400)
    response.assertBodyContains({ error: 'Invalid permissions format' })
  })

  // Test destroy method
  test('can delete a group', async ({ client, assert }) => {
    const user = await getMockUser()
    const group = await GroupFactory.create()
    
    const response = await client.delete(`/groups/${group.id}`).loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains({ id: group.id })

    const deletedGroup = await Group.find(group.id)
    assert.isNull(deletedGroup)
  })
})
