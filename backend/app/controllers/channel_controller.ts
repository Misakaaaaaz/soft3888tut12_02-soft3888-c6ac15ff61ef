import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'

export default class ChannelsController {
  async index({}: HttpContext) {
    return await Channel.query().paginate(1)
  }
  async store({ request }: HttpContext) {
    return await Channel.create(request.all())
  }
  async show({ params }: HttpContext) {
    return await Channel.findOrFail(params.id)
  }
  async update({ params, request }: HttpContext) {
    const newItem = await Channel.findOrFail(params.id)
    newItem.merge(request.all())
    await newItem.save()
    return newItem
  }
  async destroy({ params }: HttpContext) {
    const newItem = await Channel.findOrFail(params.id)
    await newItem.delete()
    return newItem
  }

}
