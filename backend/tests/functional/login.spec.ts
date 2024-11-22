import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Login', (suite) => {
  suite.each.setup(() => testUtils.db().withGlobalTransaction())

  test('can login with valid credentials', async ({ client }) => {
    const user = await UserFactory.create()
    user.merge({ password: 'password123' })
    await user.save()

    const response = await client.post('/login').json({
      email: user.email,
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertCookie('adonis-session')
  })

  test('cannot login with invalid email', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/login').json({
      email: 'wrong@example.com',
      password: user.password,
    })

    response.assertStatus(400)
    response.assertBodyContains({ errors: [{ message: 'Invalid user credentials' }] })
  })

  test('cannot login with invalid password', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/login').json({
      email: user.email,
      password: 'wrongpassword',
    })

    response.assertStatus(400)
  })

  test('cannot access protected route without login', async ({ client }) => {
    const response = await client.get('/users')
    response.assertStatus(401)
  })
})
