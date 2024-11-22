import { test } from '@japa/runner'
import New from '#models/new'
import School from '#models/school'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('News', (group) => {
  // Set up a global transaction before each test to reset the database
    group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
    })

    test('can create news with valid inputs', async ({ client }) => {
        const school = await School.create({ name: 'School 1' });

        const news = await New.create({
            title: 'News 1',
            date: '2024-10-10',
            url: "example.com",
        })

        await news.related('schools').attach([school.id])

        const response = await client.get('/news')
        response.assertStatus(200)

        response.assertBodyContains({
        data: [
            {
            title: 'News 1',
            date: '2024-10-10',
            url: "example.com",
            schools: [{ id: school.id, name: 'School 1' }],
            },
        ],
        })
    });

    test('can create news with invalid inputs', async ({ client, assert }) => {
      const school = await School.create({ name: 'School 1' });

      const news = await New.create({
          title: '', //empty title is not allowed
          date: '2024-10-10',
          url: "example.com",
      })

      await news.related('schools').attach([school.id])

    // Use assert.rejects and wait for the Promise
    await assert.rejects(async () => {
      const response = await client.get('/news')
      response.assertStatus(500)
    })
  });

    // EXISTING TEST: Update a news and sync schools (update method)
    test('can update a news and sync schools', async ({ client, assert }) => {
        const school1 = await School.create({ name: 'School 1' })
        const school2 = await School.create({ name: 'School 2' })
    
        const news = await New.create({
          title: 'News 2',
          date: '2024-10-12',
          url: "example2.com",
        })
    
        await news.related('schools').attach([school1.id])
    
        const updatedData = {
          title: 'Updated News with New School',
          schools: [school2.id], //replace school1 to school2
        }
    
        const response = await client.put(`/news/${news.id}`).json(updatedData)
        response.assertStatus(200)
    
        const updatedNews = await New.query().where('id', news.id).preload('schools').firstOrFail()
        assert.equal(updatedNews.title, updatedData.title)
        assert.lengthOf(updatedNews.schools, 1)
        assert.equal(updatedNews.schools[0].id, school2.id)
      })

    // EXISTING TEST: Delete a news (destroy method)
    test('can delete a news', async ({ client, assert }) => {
        const news = await New.create({
            title: 'News to Delete',
            date: '2024-10-13',
            url: "example3.com",
        })

        const response = await client.delete(`/news/${news.id}`)
        response.assertStatus(200)

        const deletedNews = await New.find(news.id)
        assert.isNull(deletedNews)
    })

    test('can fetch a specific news item', async ({ client }) => {
        const school = await School.create({ name: 'School 1' });
    
        const news = await New.create({
          title: 'Fetchable News',
          date: '2024-10-14',
          url: 'fetchable.com',
        });
    
        await news.related('schools').attach([school.id]);
    
        const response = await client.get(`/news/${news.id}`);
        response.assertStatus(200);
    
        response.assertBodyContains({
          id: news.id,
          title: news.title,
          date: news.date,
          url: news.url,
          schools: [{ id: school.id, name: school.name }],
        });
    });
      
    test('can update news and detach all schools', async ({ client, assert }) => {
        const school1 = await School.create({ name: 'School 1' });
        const news = await New.create({
          title: 'News to Update',
          date: '2024-10-16',
          url: 'update.com',
        });
    
        await news.related('schools').attach([school1.id]);
    
        const updatedData = {
          title: 'Updated News without Schools',
          schools: [], // Detach all schools
        };
    
        const response = await client.put(`/news/${news.id}`).json(updatedData);
        response.assertStatus(200);
    
        const updatedNews = await New.query().where('id', news.id).preload('schools').firstOrFail();
        assert.equal(updatedNews.title, updatedData.title);
        assert.lengthOf(updatedNews.schools, 0); // No schools should be attached
    });

    test('can create news without schools', async ({ client }) => {
        const newsData = {
          title: 'News without School',
          date: '2024-10-15',
          url: 'no-school.com',
        };
    
        const response = await client.post('/news').json(newsData);
        response.assertStatus(200);
    
        const createdNews = await New.query().where('title', newsData.title).firstOrFail();
        response.assertBodyContains({
          title: createdNews.title,
          date: createdNews.date,
          url: createdNews.url,
        });
      });
})