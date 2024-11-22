import User from '#models/user'
import Group from '#models/group'
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export default class PermissionService {
  private static permissionNodes: Record<string, string[]>

  static {
    this.permissionNodes = yaml.load(
      fs.readFileSync(
        path.resolve(import.meta.dirname, '../../config/permissions.yaml'), 'utf8'
      )
    ) as Record<string, string[]>
  }

  static getPermissionNodes() {
    return this.permissionNodes
  }

  static validatePermission(permission: string): boolean {
    const regex = /^[+-]?([a-z_]+)\.([a-z_]+)$/
    if (!regex.test(permission)) {
      return false
    }

    const [, node, action] = permission.match(regex)!
    return this.permissionNodes.hasOwnProperty(node) && this.permissionNodes[node].includes(action)
  }

  static async getGroupPermissions(profile: string): Promise<string[]> {
    const group = await Group.query().whereLike('name', profile).first()
    return group ? group.permissions : []
  }

  static async updateUserPermissions(user: User, permissions: string[]): Promise<User> {
    // Only save user-specific permissions (those with + or - prefix)
    const userSpecificPermissions = permissions.filter(perm => perm.startsWith('+') || perm.startsWith('-'))

    user.permissionMetadata = userSpecificPermissions
    await user.save()
    return user
  }

  static async getUserEffectivePermissions(user: User): Promise<string[]> {
    const groupPermissions = await this.getGroupPermissions(user.profile)
    const userPermissions = user.permissionMetadata || []

    const effectivePermissions: Record<string, string> = {}

    // First, apply group permissions
    for (const perm of groupPermissions) {
      effectivePermissions[perm] = perm
    }

    // Then, apply user-specific permissions, overriding group permissions if necessary
    for (const perm of userPermissions) {
      effectivePermissions[perm.startsWith('+') || perm.startsWith('-') ? perm.slice(1) : perm] = perm
    }

    return Object.values(effectivePermissions)
  }
}