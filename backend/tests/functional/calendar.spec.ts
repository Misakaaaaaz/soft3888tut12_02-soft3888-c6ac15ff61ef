import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Event from '#models/event'
import User from '#models/user'
import { DateTime } from 'luxon'
import { Profile, Access } from '#models/profile_access_enums'

// Group the tests related to Events
test.group('Events', (group) => {
  // Use a global transaction before each test to reset the state of the database
  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
  })

  // Test case: Valid event creation (valid inputs - equivalent partitioning)
  test('can create an event with valid inputs', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example0.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })

    const eventData = {
      title: 'Project Meeting', // Valid title
      description: 'Discuss updates', // Valid description
      startDate: DateTime.now(), // Valid start date
      endDate: DateTime.now().plus({ hours: 1 }), // Valid end date
      ownedById: user.id, // Valid user ID
    }

    const response = await client.post('/events').loginAs(user).json(eventData)
    response.assertStatus(200)
    assert.equal(response.body().title, 'Project Meeting')
  })

  // Test case: Invalid event creation with empty title (invalid input - equivalent partitioning)
  test('cannot create an event with empty title', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example1.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })

    const eventData = {
      title: '', // Empty title - invalid input
      description: 'Discuss updates',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ hours: 1 }),
      ownedById: user.id,
    }

    // Use assert.rejects and wait for the Promise
    await assert.rejects(async () => {
      const response = await client.post('/events').loginAs(user).json(eventData)
      response.assertStatus(500)
    })
  })

  // Test case: Invalid event creation with endDate earlier than startDate (invalid input)
  test('cannot create an event with endDate earlier than startDate', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example2.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })

    const eventData = {
      title: 'Invalid Date Event',
      description: 'End date before start date',
      startDate: DateTime.now().plus({ hours: 2 }), // Invalid - start date after end date
      endDate: DateTime.now(), // End date
      ownedById: user.id,
    }

    await assert.rejects(async () => {
      const response = await client.post('/events').loginAs(user).json(eventData)
      response.assertStatus(500)
    })
  })

  // Test case: Invalid event creation with title exceeding max length (invalid input - equivalent partitioning)
  test('cannot create an event with title exceeding max length', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example4.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })

    const longTitle = 'A'.repeat(256) // Title exceeding max length

    const eventData = {
      title: longTitle, // Invalid - too long title
      description: 'Too long title event',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ hours: 1 }),
      ownedById: user.id,
    }

    await assert.rejects(async () => {
      const response = await client.post('/events').loginAs(user).json(eventData)
      response.assertStatus(500)
    })
  })

  // Test case: Valid event creation with empty description (valid input - equivalent partitioning)
  test('can create an event with empty description', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example6.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })

    const eventData = {
      title: 'No Description Event',
      description: '', // Valid empty description
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ hours: 1 }),
      ownedById: user.id,
    }

    await assert.rejects(async () => {
      const response = await client.post('/events').loginAs(user).json(eventData)
      response.assertStatus(500)
    })
  })

  // Test case: Deleting an event (valid input - equivalent partitioning)
  test('can delete an event', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example7.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })

    // Create an event to delete
    const event = await Event.create({
      title: 'Event to be Deleted',
      description: 'This event will be deleted',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ hours: 1 }),
      ownedById: user.id,
    })

    // Send DELETE request to remove the event
    const response = await client.delete(`/events/${event.id}`).loginAs(user)
    response.assertStatus(200)

    // Confirm that the event is actually deleted
    const deletedEvent = await Event.find(event.id)
    assert.isNull(deletedEvent) // The event should no longer exist in the database
  })
  // **Equivalence Partitioning**: This test case represents the valid partition where an existing event is deleted successfully.

  test('can edit an existing event', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@example14.com',
      password: 'password',
      profile: Profile.Admin,
      access: Access.Full,
    })
  
    // Create an event to be edited
    const event = await Event.create({
      title: 'Original Event Title',
      description: 'Original event description',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ hours: 1 }),
      ownedById: user.id,
    })
  
    // New data to update the event
    const updatedEventData = {
      title: 'Updated Event Title',
      description: 'Updated event description',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ hours: 2 }), // Extend event by 1 hour
    }
  
    // Send PUT request to update the event
    const response = await client.put(`/events/${event.id}`).loginAs(user).json(updatedEventData)
    response.assertStatus(200)
  
    // Check that the event was updated correctly
    const updatedEvent = await Event.find(event.id)
    assert.equal(updatedEvent?.title, 'Updated Event Title')
    assert.equal(updatedEvent?.description, 'Updated event description')
  })
  // **Equivalence Partitioning**: This test case represents the valid partition where an event is successfully edited with new data.
  
})
