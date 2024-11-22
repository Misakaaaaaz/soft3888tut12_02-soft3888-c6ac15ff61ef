import { test } from '@japa/runner'
import Notification from '#models/notification'
import School from '#models/school'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Notifications', (group) => {
  // Set up a global transaction before each test to reset the database
    group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
    })

    test('can create notification with valid inputs', async ({ client }) => {
        const school = await School.create({ name: 'School 1' });

        const notification = await Notification.create({
            title: 'Notification 1',
            date: '2024-10-10',
            content: "this is notification",
        })

        await notification.related('schools').attach([school.id])

        const response = await client.get('/notifications')
        response.assertStatus(200)

        response.assertBodyContains({
        data: [
            {
            title: 'Notification 1',
            date: '2024-10-10',
            content: "this is notification",
            schools: [{ id: school.id, name: 'School 1' }],
            },
        ],
        })
    });

    test('can create notification with invalid inputs', async ({ client, assert }) => {
      const school = await School.create({ name: 'School 1' });

      const news = await Notification.create({
          title: '', //empty title is not allowed
          date: '2024-10-10',
          content: "this is notification",
      })

      await news.related('schools').attach([school.id])

    // Use assert.rejects and wait for the Promise
    await assert.rejects(async () => {
      const response = await client.get('/notifications')
      response.assertStatus(500)
    })
  });

    // EXISTING TEST: Update a notification and sync schools (update method)
    test('can update a notification and sync schools', async ({ client, assert }) => {
        const school1 = await School.create({ name: 'School 1' })
        const school2 = await School.create({ name: 'School 2' })
    
        const notification = await Notification.create({
          title: 'News 2',
          date: '2024-10-12',
          content: "this is notification",
        })
    
        await notification.related('schools').attach([school1.id])
    
        const updatedData = {
          title: 'Updated Notification with New School',
          schools: [school2.id], //replace school1 to school2
        }
    
        const response = await client.put(`/notifications/${notification.id}`).json(updatedData)
        response.assertStatus(200)
    
        const updatedNotification = await Notification.query().where('id', notification.id).preload('schools').firstOrFail()
        assert.equal(updatedNotification.title, updatedData.title)
        assert.lengthOf(updatedNotification.schools, 1)
        assert.equal(updatedNotification.schools[0].id, school2.id)
      })

    test('can create notification without schools', async ({ client }) => {
        const notificationData = {
          title: 'News without School',
          date: '2024-10-15',
          content: "this is notification",
        };
    
        const response = await client.post('/notifications').json(notificationData);
        response.assertStatus(200);
    
        const createdNotification = await Notification.query().where('title', notificationData.title).firstOrFail();
        response.assertBodyContains({
          title: createdNotification.title,
          date: createdNotification.date,
          content: createdNotification.content,
        });
      });

    test('can retrieve a specific notification', async ({ client }) => {
        const school = await School.create({ name: 'School 3' });
    
        const notification = await Notification.create({
          title: 'Fetchable Notification',
          date: '2024-10-24',
          content: 'Content for fetchable notification',
        });
    
        await notification.related('schools').attach([school.id]);
    
        const response = await client.get(`/notifications/${notification.id}`);
        response.assertStatus(200);
        response.assertBodyContains({
          id: notification.id,
          title: notification.title,
          content: notification.content,
          date: notification.date,
          schools: [{ id: school.id, name: school.name }],
        });
      });

    test('can update notification and detach all schools', async ({ client, assert }) => {
        const school1 = await School.create({ name: 'School 1' });
        const notification = await Notification.create({
          title: 'Notification to Update',
          date: '2024-10-16',
          content: "this is notification",
        });
    
        await notification.related('schools').attach([school1.id]);
    
        const updatedData = {
          title: 'Updated Notification without Schools',
          schools: [], // Detach all schools
        };
    
        const response = await client.put(`/notifications/${notification.id}`).json(updatedData);
        response.assertStatus(200);
    
        const updatedNotification = await Notification.query().where('id', notification.id).preload('schools').firstOrFail();
        assert.equal(updatedNotification.title, updatedData.title);
        assert.lengthOf(updatedNotification.schools, 0); // No schools should be attached
    });
        // EXISTING TEST: Delete a notification (destroy method)
    test('can delete a notification', async ({ client, assert }) => {
        const notificaiton = await Notification.create({
            title: 'Notification to Delete',
            date: '2024-10-13',
            content: "this is notification",
        })

        const response = await client.delete(`/notifications/${notificaiton.id}`)
        response.assertStatus(200)

        const deletedNotificaiton = await Notification.find(notificaiton.id)
        assert.isNull(deletedNotificaiton)
    })
})