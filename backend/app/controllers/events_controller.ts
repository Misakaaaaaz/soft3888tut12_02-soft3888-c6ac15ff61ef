import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class EventsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return await Event.query().paginate(1)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    return await Event.create(request.all())
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Event.findOrFail(params.id)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const event = await Event.findOrFail(params.id)
    event.merge(request.all())
    await event.save()
    return event
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const event = await Event.findOrFail(params.id)
    await event.delete()
    return event
  }
}
