import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import School from '#models/school'
import UserPolicy from '#policies/user_policy'
import {Profile, Access} from '../models/profile_access_enums.js'
export default class UsersController {

 
  async index({ bouncer, request }: HttpContext) {
    // Check if the user can list users
    await bouncer.with(UserPolicy).authorize('list')

    const search = request.input('search', '').toLowerCase()
    const page = request.input('page', 1)

    const usersQuery = User.query().preload('school').preload('relatedUsers');

    if (search) {
      usersQuery.whereLike('firstName', `%${search}%`)
        .orWhereLike('lastName', `%${search}%`)
        .orWhereLike('email', `%${search}%`)
    }

    const users = await usersQuery.paginate(page, 10);
    return users;
  }

  async show({ bouncer, params, response }: HttpContext) {
    try {

      const userId = Number.parseInt(params.id, 10);
      if (Number.isNaN(userId)) {
        return response.status(404).json({
          message: 'Invalid user ID. Please provide a numerical ID.',
        });
      }


      const user = await User.query()
        .where('id', params.id)
        .preload('school')
        .preload('relatedUsers')
        .firstOrFail();

      

      // Check if the user can view the user, to be noticed time-based attacks vulnerability applied
      await bouncer.with(UserPolicy).authorize('view', user)

        return user.toJSON();

    } catch (error) {
      return response.status(404).json({
        message: 'User not found', error: error.message,
      });
    }
  }

  // Create a new user
  public async store({ auth, bouncer, request, response }: HttpContext) {
    // Check if the user can create a user
    await bouncer.with(UserPolicy).authorize('create')

    const userData = request.only([
      'firstName',
      'lastName',
      'email',
      'profile',
      'userSchoolId',
      'access',
      'relatedUsers',
    ]) as {
      firstName: string
      lastName: string
      email: string
      profile: Profile
      userSchoolId: number
      access: Access
      relatedUsers: number[]
      password?: string
    }

    userData.password = 'default_password123'

    const userToCreate = {
      ...userData,
      userSchoolId: userData.userSchoolId || 1,
    }

    if (
      !userData.email || 
      !userData.firstName || 
      !userData.lastName
    ) {
      return response.status(400).json({
        message: 'All fields required.',
      });
    }
    const emails = await User.query().select('email'); // Query all emails

    for (const emailRecord of emails) {
      if (emailRecord.email === userData.email) {
        return response.status(400).json({
          message: 'Email already exists',
        });
      }
    }

    if (!(userData.email.includes('@') && userData.email.includes('.'))) {
     
      return response.status(400).json({ message: 'Email does not exist' })
    }
    if(!(Object.values(Profile).includes(userData.profile as Profile))){
      return response.status(400).json({ message: 'Profile does not exist' })
    }
    if(!(Object.values(Access).includes(userData.access as Access))){
      return response.status(400).json({ message: 'Access does not exist' })
    }
    const schoolExists = await School.find(userData.userSchoolId);
    if (!schoolExists) {
      return response.status(400).json({
        message: 'School does not exist',
      });
    }
  
    if(userData.firstName.length > 255){
      return response.status(400).json({
        message: `First name too long.`,
      });
    }
    if(userData.lastName.length > 255){
      return response.status(400).json({
        message: `Last name too long.`,
      });
    }

    try {
      const user = await User.create(userToCreate)

      if (userData.relatedUsers && userData.relatedUsers.length > 0) {
        // Validate related user IDs using alternative method if pluck is unavailable
        const validRelatedUsers = userData.relatedUsers.filter(id => id !== null);

        await user.related('relatedUsers').attach(validRelatedUsers)
      }

      // Load relatedUsers and other relationships
      await user.load('relatedUsers')
      // await user.load('school')


      // Attach the owner to the user
      await user.related('ownedBy').associate(auth.user!)

      return response.status(201).json(user)
    } catch (error) {
      console.error('Error details:', error.message || error)
      return response.status(400).json({ message: 'Failed to create user', error: error.message })
    }
  }

  // Update an existing user
  async update({ bouncer, params, request, response }: HttpContext) {

    const userId = Number.parseInt(params.id, 10);
    if (Number.isNaN(userId)) {
      return response.status(404).json({
        message: 'Invalid user ID. Please provide a numerical ID.',
      });
    }
    try {
    const user = await User.findOrFail(params.id)

    // Check if the user can edit the user
    await bouncer.with(UserPolicy).authorize('edit', user)

    // Extract the user data from the request
    const userData = request.only([
      'firstName',
      'lastName',
      'email',
      'profile',
      'userSchoolId',
      'access',
      'relatedUsers',
      'permissionMetadata',
    ]) as {
      firstName?: string
      lastName?: string
      email?: string
      profile?: Profile
      userSchoolId?: number
      access?: Access
      relatedUsers?: number[]
      permissionMetadata?: any
    }

    // Merge the data into the user instance
    user.merge(userData)


      await user.save()

      // Handle relatedUsers if provided
      if (userData.relatedUsers) {
        // Validate related user IDs using alternative method if pluck is unavailable
        const validRelatedUsers = userData.relatedUsers.filter(id => id !== null);

        // Sync relatedUsers relationship
        await user.related('relatedUsers').sync(validRelatedUsers)
      }

      // Load relatedUsers and other relationships
      await user.load('relatedUsers')
      // await user.load('schools')


      return response.status(200).json(user)
    } catch (error) {
      return response.status(404).json({
        message: 'User not found', error: error.message,
      });
    }
  }
  // Delete a user
  async destroy({ bouncer, params, response }: HttpContext) {

    try {
    const userId = Number.parseInt(params.id, 10);
    if (Number.isNaN(userId)) {
      return response.status(404).json({
        message: 'Invalid user ID. Please provide a numerical ID.',
      });
    }
    const user = await User.findOrFail(params.id);
    // Check if the user can delete the user
    await bouncer.with(UserPolicy).authorize('delete', user)
    await user.delete();
    return { message: 'User deleted successfully' };
  } catch (error) {
    return response.status(404).json({
      message: 'User not found', error: error.message,
    });
  }
  }
  // Update user's channel action (block/unblock)
  async updateChannelAction({ params, request, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id);

      const { channelId, action } = request.only(['channelId', 'action']);

      if (!channelId || !['block', 'unblock'].includes(action)) {
        return response.status(400).json({ message: 'Invalid channel action data' });
      }

      const channelActionMetadata = user.channelActionMetadata || {};
      channelActionMetadata[channelId] = action;
      user.channelActionMetadata = channelActionMetadata;

      console.log('Updated channelActionMetadata:', user.channelActionMetadata);
      await user.save();

      await user.save();

      return response.status(200).json(user);
    } catch (error) {
      return response.status(500).json({ message: 'Failed to update channel action', error: error.message });
    }
  }

  
}

