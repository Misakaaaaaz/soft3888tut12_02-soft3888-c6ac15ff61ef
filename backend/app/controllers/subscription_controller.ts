import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscriptions'

export default class SubscriptionsController {
  async index({}: HttpContext) {
    return await Subscription.query().paginate(1)
  }
  async store({ request }: HttpContext) {
    return await Subscription.create(request.all())
  }
  async show({ params }: HttpContext) {
    return await Subscription.findOrFail(params.id)
  }
  async update({ params, request }: HttpContext) {
    const newItem = await Subscription.findOrFail(params.id)
    newItem.merge(request.all())
    await newItem.save()
    return newItem
  }
  async destroy({ params }: HttpContext) {
    const newItem = await Subscription.findOrFail(params.id)
    await newItem.delete()
    return newItem
  }


}
