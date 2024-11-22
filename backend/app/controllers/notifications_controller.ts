import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'

export default class NotificationsController {

  async index({}: HttpContext) {
    return await Notification.query().preload('schools').paginate(1) // Preload related schools
  }


  async store({ request }: HttpContext) {
    const { schools, ...notificationData } = request.only(['title', 'date', 'content', 'schools']) // Expecting schools as an array of school IDs

    const notification = await Notification.create(notificationData)

    // Attach related schools (many-to-many relationship)
    if (schools && schools.length > 0) {
      await notification.related('schools').attach(schools) // Attach school IDs to the notification
    }

    return notification
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Notification.query().where('id', params.id).preload('schools').firstOrFail() // Preload schools for individual notifiaction
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)

    const { schools, ...notificationData } = request.only(['title', 'date', 'content', 'schools'])

    // Update the notifiaction fields
    notification.merge(notificationData)
    await notification.save()

    // Sync the related schools (many-to-many relationship)
    if (schools && schools.length > 0) {
      await notification.related('schools').sync(schools) // Sync the school relationship with new IDs
    } else {
      // If no schools were provided, detach all related schools
      await notification.related('schools').detach()
    }

    return notification
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    await notification.delete()
    return notification
  }
}
