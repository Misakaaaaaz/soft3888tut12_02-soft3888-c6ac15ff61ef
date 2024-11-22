import type { HttpContext } from '@adonisjs/core/http'
import Group from '#models/group'

export default class GroupController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '').toLowerCase()
    const groups = await Group.query().whereLike('name', `%${search}%`).paginate(page)
    return groups
  }

  async store({ request }: HttpContext) {
    return await Group.create(request.all())
  }

  async show({ params }: HttpContext) {
    return await Group.findOrFail(params.id)
  }

  async update({ params, request, response }: HttpContext) {
    const group = await Group.findOrFail(params.id)
    const name = request.input('name', group.name)
    const permissions = request.input('permissions', group.permissions)

    if (!name) return response.badRequest({ error: 'Name should not be empty' })
    if (!Array.isArray(permissions)) {
      return response.badRequest({ error: 'Permissions must be an array' })
    }

    try {
      const updatedGroup = await group.merge({ name, permissions }).save()
      return updatedGroup
    } catch (error) {
      return response.badRequest({ error: 'Invalid permissions format' })
    }
  }

  async destroy({ params }: HttpContext) {
    const group = await Group.findOrFail(params.id)
    await group.delete()
    return group
  }
}