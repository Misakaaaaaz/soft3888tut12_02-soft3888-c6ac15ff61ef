import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import PermissionService from '#services/permission_service'

export default class PermissionsController {
  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const permissions = request.input('permissions', [])

    if (!Array.isArray(permissions)) {
      return response.badRequest({ error: 'Permissions must be an array' })
    }

    // Ensure only user-specific permissions are being saved
    const userSpecificPermissions = permissions.filter(perm => perm.startsWith('+') || perm.startsWith('-'))

    try {
      const updatedUser = await PermissionService.updateUserPermissions(user, userSpecificPermissions)
      return response.json(updatedUser)
    } catch (error) {
      return response.badRequest({ error: 'Invalid permissions format' })
    }
  }

  async getPermissionNodes() {
    return PermissionService.getPermissionNodes()
  }

  async show({ params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return await PermissionService.getUserEffectivePermissions(user)
  }

  async getGroupPermissions({ request }: HttpContext) {
    const profile = request.input('profile')
    return await PermissionService.getGroupPermissions(profile)
  }
}