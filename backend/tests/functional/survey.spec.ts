import { test } from '@japa/runner'
import Survey from '#models/survey'
import School from '#models/school'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Surveys', (group) => {
  // Set up a global transaction before each test to reset the database
  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
  })

  // EXISTING TEST: Retrieve paginated list of surveys with preloaded schools (index method)
  test('can retrieve paginated list of surveys with preloaded schools', async ({ client }) => {
    const school = await School.create({ name: 'Test School' })

    const survey = await Survey.create({
      title: 'Test Survey',
      description: 'This is a test survey',
      level: 1,
    })

    await survey.related('schools').attach([school.id])

    const response = await client.get('/surveys')
    response.assertStatus(200)

    response.assertBodyContains({
      data: [
        {
          title: 'Test Survey',
          schools: [{ id: school.id, name: 'Test School' }],
        },
      ],
    })
  })

  // EXISTING TEST: Create a new survey with schools (store method)
  test('can create a new survey with schools', async ({ client }) => {
    const school1 = await School.create({ name: 'Test School' })

    const surveyData = {
      title: 'Survey with School',
      description: 'This survey has an associated school',
      level: 1,
      schools: [school1.id],
    }

    const response = await client.post('/surveys').json(surveyData)
    response.assertStatus(200)

    response.assertBodyContains({
      title: surveyData.title,
      description: surveyData.description,
      level: surveyData.level,
      schools: [{ id: school1.id, name: 'Test School' }],

    })
  })

  // EXISTING TEST: Retrieve a specific survey by ID (show method)
  test('can retrieve a specific survey by ID', async ({ client }) => {
    const school = await School.create({ name: 'Test School' })

    const survey = await Survey.create({
      title: 'Survey 1',
      description: 'Description of survey 1',
      level: 2,
    })

    await survey.related('schools').attach([school.id])

    const response = await client.get(`/surveys/${survey.id}`)
    response.assertStatus(200)

    response.assertBodyContains({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      schools: [{ id: school.id, name: school.name }],
    })
  })

  // EXISTING TEST: Update a survey and sync schools (update method)
  test('can update a survey and sync schools', async ({ client, assert }) => {
    const school1 = await School.create({ name: 'School 1' })
    const school2 = await School.create({ name: 'School 2' })

    const survey = await Survey.create({
      title: 'Survey with Multiple Schools',
      description: 'This survey will have multiple schools',
      level: 1,
    })

    await survey.related('schools').attach([school1.id])

    const updatedData = {
      title: 'Updated Survey with New Schools',
      schools: [school2.id],
    }

    const response = await client.put(`/surveys/${survey.id}`).json(updatedData)
    response.assertStatus(200)

    const updatedSurvey = await Survey.query().where('id', survey.id).preload('schools').firstOrFail()
    assert.equal(updatedSurvey.title, updatedData.title)
    assert.lengthOf(updatedSurvey.schools, 1)
    assert.equal(updatedSurvey.schools[0].id, school2.id)
  })

  // EXISTING TEST: Delete a survey (destroy method)
  test('can delete a survey', async ({ client, assert }) => {
    const survey = await Survey.create({
      title: 'Survey to Delete',
      description: 'This survey will be deleted',
      level: 1,
    })

    const response = await client.delete(`/surveys/${survey.id}`)
    response.assertStatus(200)

    const deletedSurvey = await Survey.find(survey.id)
    assert.isNull(deletedSurvey)
  })

  // NEW TEST: Create a new survey without schools (store method, lines 32-34)
  test('can create a new survey without any schools', async ({ client }) => {
    const surveyData = {
      title: 'Survey without Schools',
      description: 'This survey has no associated schools',
      level: 1,
      schools: [], // No schools
    }

    const response = await client.post('/surveys').json(surveyData)
    response.assertStatus(200)

    response.assertBodyContains({
      title: 'Survey without Schools',
      description: 'This survey has no associated schools',
      level: 1,
      schools: [], // Verify no schools attached
    })
  })

  // NEW TEST: Update a survey and detach all schools (update method, lines 40-55)
  test('can update a survey and detach all schools', async ({ client, assert }) => {
    const school = await School.create({ name: 'School to Detach' })

    const survey = await Survey.create({
      title: 'Survey to Detach Schools',
      description: 'This survey will have its schools detached',
      level: 2,
    })

    await survey.related('schools').attach([school.id])

    const updatedData = {
      title: 'Survey without Schools',
      description: 'All schools will be removed',
      level: 1,
      schools: [], // Empty array to detach schools
    }

    const response = await client.put(`/surveys/${survey.id}`).json(updatedData)
    response.assertStatus(200)

    const updatedSurvey = await Survey.query().where('id', survey.id).preload('schools').firstOrFail()
    assert.equal(updatedSurvey.title, updatedData.title)
    assert.lengthOf(updatedSurvey.schools, 0) // Confirm no schools are attached
  })

  // NEW TEST: Retrieve paginated list of surveys with preloaded schools (index method, lines 9-11)
  test('can retrieve paginated list of surveys with preloaded schools', async ({ client }) => {
    const school = await School.create({ name: 'Test School' })

    const survey = await Survey.create({
      title: 'Test Survey',
      description: 'This is a test survey',
      level: 1,
    })

    await survey.related('schools').attach([school.id])

    const response = await client.get('/surveys?page=1')
    response.assertStatus(200)

    response.assertBodyContains({
      data: [
        {
          title: 'Test Survey',
          schools: [{ id: school.id, name: 'Test School' }],
        },
      ],
    })

    response.assertBodyContains({ meta: { currentPage: 1 } })
  })
})
