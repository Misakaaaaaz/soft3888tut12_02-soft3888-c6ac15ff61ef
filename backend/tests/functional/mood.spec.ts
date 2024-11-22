import { test } from '@japa/runner'
import Mood from '#models/mood'
import testUtils from '@adonisjs/core/services/test_utils'

// Group the tests related to Moods
test.group('Moods', (group) => {
  // Set up a global transaction before each test to reset the database
  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
  })

  // Test case: Retrieve paginated list of moods (index method)
  test('can retrieve paginated list of moods', async ({ client }) => {
    // Assume we have some moods created
    await Mood.create({
      name: 'Happy',
      imageUrl: 'https://example.com/happy.png',
    })

    const response = await client.get('/moods')
    response.assertStatus(200)

    // Ensure that we receive a paginated response
    response.assertBodyContains({ meta: { currentPage: 1 } })
  })

  // Test case: Create a new mood (store method)
  test('can create a new mood', async ({ client }) => {
    const moodData = {
      name: 'Excited',
      imageUrl: 'https://example.com/excited.png',
    }

    const response = await client.post('/moods').json(moodData)
    response.assertStatus(200)
    response.assertBodyContains({
      name: moodData.name,
      imageUrl: moodData.imageUrl,
    })
  })

  // Test case: Retrieve a single mood by ID (show method)
  test('can retrieve a specific mood by ID', async ({ client }) => {
    const mood = await Mood.create({
      name: 'Happy',
      imageUrl: 'https://example.com/happy.png',
    })

    const response = await client.get(`/moods/${mood.id}`)
    response.assertStatus(200)

    // Verify that the correct mood is returned
    response.assertBodyContains({ id: mood.id })
  })

  // Test case: Update an existing mood (update method)
  test('can update an existing mood', async ({ client, assert }) => {
    const mood = await Mood.create({
      name: 'Happy',
      imageUrl: 'https://example.com/happy.png',
    })

    const updatedData = {
      name: 'Excited',
      imageUrl: 'https://example.com/excited.png',
    }

    const response = await client.put(`/moods/${mood.id}`).json(updatedData)
    response.assertStatus(200)

    // Fetch the updated mood and confirm changes
    const updatedMood = await Mood.find(mood.id)
    assert.equal(updatedMood?.name, updatedData.name)
    assert.equal(updatedMood?.imageUrl, updatedData.imageUrl)
  })

  // Test case: Delete a mood (destroy method)
  test('can delete a mood', async ({ client, assert }) => {
    const mood = await Mood.create({
      name: 'Happy',
      imageUrl: 'https://example.com/happy.png',
    })

    const response = await client.delete(`/moods/${mood.id}`)
    response.assertStatus(200)

    // Ensure the mood is actually deleted
    const deletedMood = await Mood.find(mood.id)
    assert.isNull(deletedMood)
  })
})
