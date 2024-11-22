import type { HttpContext } from '@adonisjs/core/http'
import Recipient from '#models/recipient'

export default class RecipientsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return await Recipient.query().paginate(1)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    return await Recipient.create(request.all())
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Recipient.findOrFail(params.id)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const recipient = await Recipient.findOrFail(params.id)
    recipient.merge(request.all())
    await recipient.save()
    return recipient
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const recipient = await Recipient.findOrFail(params.id)
    await recipient.delete()
    return recipient
  }
}
