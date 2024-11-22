// tests/functional/users.spec.ts

import { test } from '@japa/runner'
import User from '#models/user'
import School from '#models/school'
import testUtils from '@adonisjs/core/services/test_utils'
import { Profile, Access } from '#models/profile_access_enums' // Ensure the correct path and extension

test.group('Users', (group) => {
  // Set up a global transaction before each test to reset the database
  
  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
  })

  // Helper function to create a user with default data
  //const createUser = async (overrides = {}) => {
  async function getUser() {
    const school = await School.create({ name: 'Test School' })
    
    const user = await User.create({
          firstName: 'John',
          lastName: 'Doe',
          email:`test${Math.random()}@example.com`,
          password: 'password',
          profile: Profile.Admin,
          access: Access.Full,
          permissionNode: 'user',
          ownedById: 1,
          userSchoolId: school.id,
        })
     
    return { user, school }
  }

  

  // TEST: Retrieve paginated list of users with preloaded school and relatedUsers (index method)
  test('can retrieve paginated list of users with preloaded relations', async ({ client }) => {
   
    const { user, school } = await getUser()
   

    const relatedUser = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: `jane.smith${Math.random()}@example.com`,
      password: 'anotherpassword',
      profile: Profile.Student, // Use enum
      access: Access.Low,  
      permissionNode: 'user',   
      ownedById: 1,
      userSchoolId: school.id,
    })
    await user.related('relatedUsers').attach([relatedUser.id])
   
    const response = await client.get('/users').loginAs(user)
    response.assertStatus(200)
   

    response.assertBodyContains({
        data: [
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,

            userSchoolId: school.id,
            ownedById: user.ownedById,
            relatedUsers: [
              { 
                id: relatedUser.id, 
                firstName: relatedUser.firstName, 
                lastName: relatedUser.lastName, 
                email: relatedUser.email, 

              },
            ],
            permissions: []
          },
          {
            id: relatedUser.id,
            firstName: relatedUser.firstName,
            lastName: relatedUser.lastName,
            email: relatedUser.email,
            userSchoolId: school.id,
            ownedById: relatedUser.ownedById,
            relatedUsers: [],
            permissions: []
          }
        ]
      })
      
  })

  
//   test('can create a new user with related users', async ({ client }) => {
//     const { user, school } = await getUser()
//     const relatedUser1 = await User.create({
//       firstName: 'Alice',
//       lastName: 'Wonderland',
//       email: `alice${Math.random()}@example.com`,
//       password: 'password1',
//       profile: Profile.Student, // Use enum
//       access: Access.Full,     // Use enum
//       userSchoolId: school.id,
//       permissionNode: 'user',
//       ownedById: 1,
//     })
   

//     const relatedUser2 = await User.create({
//       firstName: 'Bob',
//       lastName: 'Builder',
//       email: `bob${Math.random()}@example.com`,
//       password: 'password2',
//       profile: Profile.Parent, // Use enum
//       access: Access.Low,     // Use enum
//       userSchoolId: school.id,
//       permissionNode: 'user',
//       ownedById: 1,
//     })

//     const userData = {
//       firstName: 'Charlie',
//       lastName: 'Brown',
//       email: `charlie${Math.random()}@example.com`,
//       password: 'password3',
//       profile: Profile.Parent, // Use enum
//       access: Access.Full,     // Use enum
//       userSchoolId: school.id,
//       relatedUsers: [relatedUser1.id, relatedUser2.id],
//       permissionNode: 'user',
//       ownedById: 1,
//     }
    
//     const response = await client.post('/users').json(userData).loginAs(user)
//     console.log('API Response:', response.body())
//     response.assertStatus(201)
    

//     response.assertBodyContains({
//       firstName: userData.firstName,
//       lastName: userData.lastName,
//       email: userData.email,
//     //   profile: userData.profile,
//     //   access: userData.access,
//         userSchoolId: school.id,
//       relatedUsers: [
//         { id: relatedUser1.id, firstName: 'Alice', lastName: 'Wonderland', email: relatedUser1.email,  },
//         { id: relatedUser2.id, firstName: 'Bob', lastName: 'Builder', email: relatedUser2.email },
//       ],
//     })
//   })

  // TEST: Create a new user without related users (store method)
  test('can create a new user without any related users', async ({ client }) => {
    const { user, school } = await getUser()

    const userData = {
      firstName: 'Daisy',
      lastName: 'Duck',
      email: `daisy${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: [], // No related users
    }

    const response = await client.post('/users').json(userData).loginAs(user)
    response.assertStatus(201)

    response.assertBodyContains({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userSchoolId: school.id,
    })
  })

  // TEST: Retrieve a specific user by ID (show method)
  test('can retrieve a specific user by ID', async ({ client }) => {
    const { user, school } = await getUser()

    const relatedUser = await User.create({
      firstName: 'Eve',
      lastName: 'Online',
      email: `eve${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
    })

    await user.related('relatedUsers').attach([relatedUser.id])

    const response = await client.get(`/users/${user.id}`).loginAs(user)
    response.assertStatus(200)

    response.assertBodyContains({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userSchoolId: school.id,
      relatedUsers: [
        {
          id: relatedUser.id,
          firstName: 'Eve',
          lastName: 'Online',
          email: relatedUser.email,
        },
      ],
    })
  })

  // TEST: Update a user and sync related users (update method)
  test('can update a user and sync related users', async ({ client, assert }) => {
    const { user, school } = await getUser()

    const relatedUser1 = await User.create({
      firstName: 'Frank',
      lastName: 'Castle',
      email: `frank${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
    })

    const relatedUser2 = await User.create({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: `grace${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
    })

    // Initially attach relatedUser1
    await user.related('relatedUsers').attach([relatedUser1.id])

    const updatedData = {
      firstName: 'John Updated',
      relatedUsers: [relatedUser2.id], // Sync to only relatedUser2
    }

    const response = await client.put(`/users/${user.id}`).json(updatedData).loginAs(user)
    response.assertStatus(200)
    

    const updatedUser = await User.query()
      .where('id', user.id)
      .preload('relatedUsers')
      .firstOrFail()

    assert.equal(updatedUser.firstName, updatedData.firstName)
    assert.lengthOf(updatedUser.relatedUsers, 1)
    assert.equal(updatedUser.relatedUsers[0].id, relatedUser2.id)
  })

  // TEST: Update a user and detach all related users (update method)
  test('can update a user and detach all related users', async ({ client, assert }) => {
    const { user, school } = await getUser()

    const relatedUser = await User.create({
      firstName: 'Hank',
      lastName: 'Pym',
      email: `hank${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
    })

    await user.related('relatedUsers').attach([relatedUser.id])

    const updatedData = {
      firstName: 'Hank Updated',
      relatedUsers: [], // Detach all related users
    }

    const response = await client.put(`/users/${user.id}`).json(updatedData).loginAs(user)
    response.assertStatus(200)

    const updatedUser = await User.query()
      .where('id', user.id)
      .preload('relatedUsers')
      .firstOrFail()

    assert.equal(updatedUser.firstName, updatedData.firstName)
    assert.lengthOf(updatedUser.relatedUsers, 0) // Confirm no related users are attached
  })

  // TEST: Delete a user (destroy method)
  test('can delete a user', async ({ client, assert }) => {
    const { user } = await getUser()

    const response = await client.delete(`/users/${user.id}`).loginAs(user)
    response.assertStatus(200)

    const deletedUser = await User.find(user.id)
    assert.isNull(deletedUser)
  })



  // TEST: Retrieve paginated list of users with search and pagination (index method)
  test('can retrieve paginated list of users with search and pagination', async ({ client }) => {
    const { user, school } = await getUser()

    // Create additional users for pagination
    for (let i = 0; i < 15; i++) {
      await User.create({
        firstName: `User${i}`,
        lastName: `Test${i}`,
        email: `user${i}${Math.random()}@example.com`,
        profile: Profile.Student, // Use enum
        access: Access.Low,     // Use enum
        userSchoolId: school.id,
      })
    }

    const response = await client.get('/users?page=2&search=user').loginAs(user)
    response.assertStatus(200)

    response.assertBodyContains({
      data: [
        
      ],
      meta: {
        currentPage: 2,
       
      },
    })
  })

//   // =======================
//   // Equivalence Partitioning Tests
//   // =======================

  // TEST: Create user with invalid email formats
  test('should not create user with invalid email format', async ({ client }) => {
    const { user, school } = await getUser()

    const invalidEmails = [
      'plainaddress',
      'missingusername',
      'username',
      'username',
      'usernamedomaincom',
    ]

    for (const email of invalidEmails) {
      const userData = {
        firstName: 'Invalid',
        lastName: 'Email',
        email: email,
        profile: Profile.Student, // Use enum
        access: Access.Low,     // Use enum
        userSchoolId: school.id,
        relatedUsers: [],
      }

      const response = await client.post('/users').json(userData).loginAs(user)
      response.assertStatus(400) // Assuming validation returns 400
    //   response.assertBodyContains({
    //     errors: [
    //       {
    //         message: 'Email does not exist',
    //       },
    //     ],
    //   })
    }
  })

  // TEST: Create user with invalid profile values
  test('should not create user with invalid profile value', async ({ client }) => {
    const { user,school } = await getUser()

    const invalidProfiles = ['superuser', 'guest', '', null, undefined]

    for (const profile of invalidProfiles) {
      const userData = {
        firstName: 'Invalid',
        lastName: 'Profile',
        email: `invalid.profile${Math.random()}@example.com`,
        profile: profile as Profile, // Use enum type casting
        access: Access.Low,          // Use enum
        userSchoolId: school.id,
        relatedUsers: [],
      }

      const response = await client.post('/users').json(userData).loginAs(user)
      response.assertStatus(400) // Assuming validation returns 400
    //   response.assertBodyContains({
    //     errors: [
    //       {

    //         message: 'Profile does not exist',
    //       },
    //     ],
    //   })
    }
  })

  // TEST: Create user with invalid access values
  test('should not create user with invalid access value', async ({ client }) => {
    const { user,school } = await getUser()

    const invalidAccessValues = ['superadmin', 'guest', '', null, undefined]

    for (const access of invalidAccessValues) {
      const userData = {
        firstName: 'Invalid',
        lastName: 'Access',
        email: `invalid.access${Math.random()}@example.com`,
        profile: Profile.Student, // Use enum
        access: access as Access, // Use enum type casting
        userSchoolId: school.id,
        relatedUsers: [],
      }

      const response = await client.post('/users').json(userData).loginAs(user)
      response.assertStatus(400) // Assuming validation returns 400
    //   response.assertBodyContains({
    //     errors: [
    //       {
    //         field: 'access',
    //         message: 'Access does not exist',
    //       },
    //     ],
    //   })
    }
  })

  // TEST: Create user with non-existing userSchoolId
  test('should not create user with non-existing userSchoolId', async ({ client }) => {
    const invalidSchoolId = 9999 // Assuming this ID does not exist
    const { user } = await getUser()


    const userData = {
      firstName: 'Invalid',
      lastName: 'School',
      email: `invalid.school${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: invalidSchoolId, // Non-existing school ID
      relatedUsers: [],
    }

    const response = await client.post('/users').json(userData).loginAs(user)
    response.assertStatus(400) // Assuming validation returns 400
    // response.assertBodyContains({
    //   errors: [
    //     {
    //       field: 'userSchoolId',
    //       message: 'School does not exist',
    //     },
    //   ],
    // })
  })

  // TEST: Create user with non-existing relatedUsers IDs
  test('should not create user with non-existing relatedUsers IDs', async ({ client }) => {
    const { user, school } = await getUser()

    const invalidRelatedUserIds = [9999, 10000] // Assuming these IDs do not exist

    const userData = {
      firstName: 'Invalid',
      lastName: 'RelatedUsers',
      email: `invalid.related${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: invalidRelatedUserIds,
    }

    const response = await client.post('/users').json(userData).loginAs(user)
    response.assertStatus(400) // Assuming validation returns 400
    // response.assertBodyContains({
    //   errors: [
    //     {
    //       field: 'relatedUsers',
    //       message: 'User does not exist',
    //     },
    //   ],
    // })
  })

//   // =======================
//   // Boundary Analysis Tests
//   // =======================

  // TEST: Create user with minimum length for firstName and lastName
  test('should create user with minimum allowed firstName and lastName lengths', async ({ client }) => {
    const { user,school } = await getUser()

    const userData = {
      firstName: 'A', // Minimum length
      lastName: 'B',  // Minimum length
      email: `min.length${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: [],
    }

    const response = await client.post('/users').json(userData).loginAs(user)
    
    response.assertStatus(201)
    response.assertBodyContains({
      firstName: 'A',
      lastName: 'B',
      email: userData.email,
      userSchoolId: school.id
    })
  })

  // TEST: Create user exceeding maximum length for firstName and lastName
  test('should not create user when firstName or lastName exceeds maximum length', async ({ client }) => {
    const { user, school } = await getUser()

    const longString = 'A'.repeat(256) // Assuming max length is 255

    const userData = {
      firstName: longString,
      lastName: 'lastName',
      email: `max.length${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: [],
    }

    const response = await client.post('/users').json(userData).loginAs(user)
    response.assertStatus(400) // Assuming validation returns 400
    response.assertBodyContains({

          message: 'First name too long.',
    })
  })

  // TEST: Create user with many allowed relatedUsers
  test('should create user with many allowed relatedUsers', async ({ client }) => {
    const { user,school } = await getUser()

    // Assuming the maximum allowed related users is 10
    const relatedUsers = []
    for (let i = 0; i < 10; i++) {
      const relatedUser = await User.create({
        firstName: `Related${i}`,
        lastName: `User${i}`,
        email: `related${i}${Math.random()}@example.com`,
        profile: Profile.Student, // Use enum
        access: Access.Low,     // Use enum
        userSchoolId: school.id,
      })
      relatedUsers.push(relatedUser.id)
    }

    const userData = {
      firstName: 'Max',
      lastName: 'RelatedUsers',
      email: `max.related${Math.random()}@example.com`,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: relatedUsers, // Maximum allowed
    }

    const response = await client.post('/users').json(userData).loginAs(user)

    response.assertStatus(201);

// Assert that the response contains the main fields
    response.assertBodyContains({
    firstName: 'Max',
    lastName: 'RelatedUsers',
    email: userData.email,
    userSchoolId: school.id,
    });

    const responseBody = response.body();
    const actualRelatedUserIds = responseBody.relatedUsers.map((u: any) => u.id);
    const expectedRelatedUserIds = relatedUsers;

    if (actualRelatedUserIds.length !== expectedRelatedUserIds.length) {
    throw new Error('Mismatch in number of related users');
    }

  })

  // TEST: Update user with minimum and maximum boundary values
  test('should handle boundary values when updating user', async ({ client, assert }) => {
    const { user } = await getUser()

    // Update with minimum boundary values
    const minUpdateData = {
      firstName: 'B',
      lastName: 'C',
    }

    let response = await client.put(`/users/${user.id}`).json(minUpdateData).loginAs(user)
    response.assertStatus(200)
    assert.equal(response.body().firstName, 'B')
    assert.equal(response.body().lastName, 'C')

    // Update with maximum boundary values
    const longString = 'D'.repeat(255) // Assuming max length is 255
    const maxUpdateData = {
      firstName: longString,
      lastName: longString,
    }

    response = await client.put(`/users/${user.id}`).json(maxUpdateData).loginAs(user)
    response.assertStatus(200)
    assert.equal(response.body().firstName, longString)
    assert.equal(response.body().lastName, longString)
  })

//   // =======================
//   // Additional Equivalence & Boundary Tests
//   // =======================

  // TEST: Create user with duplicate email
  test('should not create user with duplicate email', async ({ client }) => {
    const { user, school } = await getUser()

    const email = `duplicate${Math.random()}@example.com`

    const userData1 = {
      firstName: 'First',
      lastName: 'User',
      email: email,
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: [],
    }

    const userData2 = {
      firstName: 'Second',
      lastName: 'User',
      email: email, // Duplicate email
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: [],
    }

    // Create first user
    let response = await client.post('/users').json(userData1).loginAs(user)
    response.assertStatus(201)

    // Attempt to create second user with same email
    response = await client.post('/users').json(userData2).loginAs(user)
    response.assertStatus(400) // Assuming unique constraint returns 400
    response.assertBodyContains({
          message: 'Email already exists',

    })
  })

  // TEST: Create user without required fields
  test('should not create user when required fields are missing', async ({ client }) => {
    const {user, school } = await getUser()

    const userData = {
      // Missing firstName, lastName, email
      profile: Profile.Student, // Use enum
      access: Access.Low,     // Use enum
      userSchoolId: school.id,
      relatedUsers: [],
    }

    const response = await client.post('/users').json(userData).loginAs(user)
    response.assertStatus(400) // Assuming validation returns 400
    response.assertBodyContains({
          message: 'All fields required.'
    })
  })


  // TEST: Retrieve user with non numerical ID format
  test('should return 404 when retrieving user with non-numeric ID', async ({ client }) => {
    const {user } = await getUser()
    const response = await client.get('/users/invalid-id').loginAs(user)
    response.assertStatus(404) // Assuming route validation returns 404 for invalid ID
    response.assertBodyContains({
      message: 'Invalid user ID. Please provide a numerical ID.',
    })
  })

  // TEST: Retrieve user with invalid ID format
  test('should return 404 when getting user with wrong ID', async ({ client }) => {
    const {user } = await getUser()
    const response = await client.get(`/users/${290}`).loginAs(user)
    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User not found',
    })
  })

  // TEST: Delete user with no numerical ID format
  test('should return 404 when deleting user with non-numeric ID', async ({ client }) => {
    const {user } = await getUser()
    const response = await client.delete('/users/invalid-id').loginAs(user)
    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Invalid user ID. Please provide a numerical ID.',
    })
  })

  test('should return 404 when deleting user with invalid user ID', async ({ client }) => {
    const {user } = await getUser()
    const response = await client.delete(`/users/${290}`).loginAs(user)
    response.assertStatus(404)
    response.assertBodyContains({
        message: 'User not found',
    })
  })

  test('should return 404 when updating user with non-numeric ID', async ({ client }) => {
    const {user } = await getUser()
    const nameUpdate = {
        firstName: 'Bob',
        lastName: 'Connor',
      }
  
    const response = await client.put('/users/invalid-id').json(nameUpdate).loginAs(user)
    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Invalid user ID. Please provide a numerical ID.',
    })
  })

  test('should return 404 when updating user with invalid user ID', async ({ client }) => {
    const {user } = await getUser()
    const nameUpdate = {
        firstName: 'Bob',
        lastName: 'Connor',
      }
  
    const response = await client.put(`/users/${2960}`).json(nameUpdate).loginAs(user)
    response.assertStatus(404)
    response.assertBodyContains({
        message: 'User not found',
    })
  })
})
