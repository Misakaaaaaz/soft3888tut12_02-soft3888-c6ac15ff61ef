import { test } from '@japa/runner'
import SosMessage from '#models/sos_message'
import testUtils from '@adonisjs/core/services/test_utils'

// Group the tests related to SOS Messages
test.group('SOS Messages', (group) => {
  // Set up a global transaction before each test to reset the database
  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
  })

  // Test case: Retrieve paginated list of SOS messages (index method)
  test('can retrieve paginated list of SOS messages', async ({ client }) => {
    // Assume we have some SOS messages created
    await SosMessage.create({
      name: 'John Doe',
      email: 'john@example.com',
      school: 'School A',
      contact: '123456789',
      batch: 'Batch 1'
    })

    const response = await client.get('/sos_messages')
    response.assertStatus(200)

    // Ensure that we receive a paginated response
    response.assertBodyContains({ meta: { currentPage: 1 } })
  })

  // Test case: Create a new SOS message (store method)
  test('can create a new SOS message', async ({ client }) => {
    const sosMessageData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      school: 'School B',
      contact: '987654321',
      batch: 'Batch 2'
    }

    const response = await client.post('/sos_messages').json(sosMessageData)
    response.assertStatus(200)
    response.assertBodyContains({
      name: sosMessageData.name,
      email: sosMessageData.email,
      school: sosMessageData.school,
      contact: sosMessageData.contact,
      batch: sosMessageData.batch,
    })
  })

  // Test case: Retrieve a single SOS message by ID (show method)
  test('can retrieve a specific SOS message by ID', async ({ client }) => {
    const sosMessage = await SosMessage.create({
      name: 'John Doe',
      email: 'john@example.com',
      school: 'School A',
      contact: '123456789',
      batch: 'Batch 1'
    })

    const response = await client.get(`/sos_messages/${sosMessage.id}`)
    response.assertStatus(200)

    // Verify that the correct SOS message is returned
    response.assertBodyContains({ id: sosMessage.id })
  })

  // Test case: Update an existing SOS message (update method)
  test('can update an existing SOS message', async ({ client, assert }) => {
    const sosMessage = await SosMessage.create({
      name: 'John Doe',
      email: 'john@example.com',
      school: 'School A',
      contact: '123456789',
      batch: 'Batch 1'
    })

    const updatedData = {
      name: 'John Updated',
      email: 'john_updated@example.com',
      school: 'School A Updated',
      contact: '111222333',
      batch: 'Batch 3'
    }

    const response = await client.put(`/sos_messages/${sosMessage.id}`).json(updatedData)
    response.assertStatus(200)

    // Fetch the updated SOS message and confirm changes
    const updatedSosMessage = await SosMessage.find(sosMessage.id)
    assert.equal(updatedSosMessage?.name, updatedData.name)
    assert.equal(updatedSosMessage?.email, updatedData.email)
    assert.equal(updatedSosMessage?.school, updatedData.school)
    assert.equal(updatedSosMessage?.contact, updatedData.contact)
    assert.equal(updatedSosMessage?.batch, updatedData.batch)
  })

  // Test case: Delete an SOS message (destroy method)
  test('can delete an SOS message', async ({ client, assert }) => {
    const sosMessage = await SosMessage.create({
      name: 'John Doe',
      email: 'john@example.com',
      school: 'School A',
      contact: '123456789',
      batch: 'Batch 1'
    })

    const response = await client.delete(`/sos_messages/${sosMessage.id}`)
    response.assertStatus(200)

    // Ensure the SOS message is actually deleted
    const deletedSosMessage = await SosMessage.find(sosMessage.id)
    assert.isNull(deletedSosMessage)
  })
})
