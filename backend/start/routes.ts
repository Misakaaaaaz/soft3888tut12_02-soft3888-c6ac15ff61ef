/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.resource('events', '#controllers/events_controller').apiOnly()
router.resource('channels', '#controllers/channel_controller').apiOnly()
router.resource('subscriptions', '#controllers/subscription_controller').apiOnly()
router.resource('news', '#controllers/news_controller').apiOnly()
router.resource('notifications', '#controllers/notifications_controller').apiOnly()
router.resource('recipients', '#controllers/recipients_controller').apiOnly()
router.resource('schools', '#controllers/schools_controller').apiOnly()
router.resource('sos_messages', '#controllers/sos_messages_controller').apiOnly()
router.resource('surveys', '#controllers/surveys_controller').apiOnly()

// router.resource('users', '#controllers/users_controller').apiOnly()
router.resource('moods', '#controllers/mood_controller').apiOnly()
// router.post('login', '#controllers/login_controller.post')
router.resource('users', '#controllers/users_controller').apiOnly().middleware('*', middleware.auth())
router.put('/users/:id/channel-action', '#controllers/users_controller.updateChannelAction');

router.post('/groups/nodes', '#controllers/groups_controller.updatePermissionNodes')
router.resource('groups', '#controllers/groups_controller').apiOnly().middleware('*', middleware.auth())
router.get('permissions', '#controllers/permissions_controller.getPermissionNodes')
router.post('login', '#controllers/login_controller.post')

router.group(() => {
  router.put('/users/:id/permissions', '#controllers/permissions_controller.update')
  router.get('/permissions/nodes', '#controllers/permissions_controller.getPermissionNodes')
  // Remove the '/permissions/actions' route
  router.get('/users/:id/permissions', '#controllers/permissions_controller.show')
  router.get('/permissions/group', '#controllers/permissions_controller.getGroupPermissions')
}).middleware(middleware.auth())

