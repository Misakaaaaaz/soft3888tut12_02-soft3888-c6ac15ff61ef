import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Subscription from '#models/subscriptions'
// import Database from '@ioc:Adonis/Lucid/Database'

// Group the tests related to Subscriptions
test.group('Subscriptions', (group) => {
  // Set up a global transaction before each test to reset the database
  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
  })

  // Test case: Retrieve all subscriptions (index method)
  test('can retrieve paginated list of subscriptions', async ({ client }) => {
    // Assume we have some subscriptions created
    await Subscription.create({
      user_id: 1,
      channel_id: 1,
    })

    const response = await client.get('/subscriptions')
    response.assertStatus(200)

    // Ensure that we receive a paginated response
    response.assertBodyContains({ meta: { currentPage: 1 } })
  })

  // Test case: Create a new subscription (store method)
  test('can create a new subscription', async ({ client }) => {
    const subscriptionData = {
      user_id: 1,
      channel_id: 2,
    }

    const response = await client.post('/subscriptions').json(subscriptionData)
    response.assertStatus(200)
    response.assertBodyContains({
      userId: subscriptionData.user_id,
      channelId: subscriptionData.channel_id,
    })
  })

  // Test case: Retrieve a single subscription by ID (show method)
  test('can retrieve a specific subscription by ID', async ({ client }) => {
    const subscription = await Subscription.create({
      user_id: 1,
      channel_id: 1,
    })

    const response = await client.get(`/subscriptions/${subscription.id}`)
    response.assertStatus(200)

    // Verify that the correct subscription is returned
    response.assertBodyContains({ id: subscription.id })
  })

  // Test case: Update an existing subscription (update method)
  test('can update an existing subscription', async ({ client, assert }) => {
    const subscription = await Subscription.create({
      user_id: 1,
      channel_id: 1,
    })

    const updatedData = {
      user_id: 2, // Change to another user
    }

    const response = await client.put(`/subscriptions/${subscription.id}`).json(updatedData)
    response.assertStatus(200)

    // Fetch the updated subscription and confirm changes
    const updatedSubscription = await Subscription.find(subscription.id)
    assert.equal(updatedSubscription?.user_id, updatedData.user_id)
  })

//   Test case: Delete a subscription (destroy method)
  test('can delete a subscription', async ({ client, assert }) => {
    const subscription = await Subscription.create({
      user_id: 1,
      channel_id: 1,
    })

    const response = await client.delete(`/subscriptions/${subscription.id}`)
    response.assertStatus(200)

    // Ensure the subscription is actually deleted
    const deletedSubscription = await Subscription.find(subscription.id)
    assert.isNull(deletedSubscription)
  })
})
