import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  async before(user: User | null) {
    // if the user is not logged in, they can't do anything
    if (!user) return false

    // if the user is an admin, they can do anything
    if (await user.hasPermission(`${user.permissionNode}.admin`)) return true
    // loads the user's ownedBy relationship
    if (user) await user.load('ownedBy')

    // and proceed to the action methods
  }

  /* single user policies */
  create(user: User): AuthorizerResponse {
    return user.hasPermission(`${user.permissionNode}.create`)
  }

  view(user: User, target: User): AuthorizerResponse {
    return user.hasPermission(`${user.permissionNode}.read`)
      || user.id === target.id
      || user.ownedBy.id === target.id
  }

  edit(user: User, target: User): AuthorizerResponse {
    return user.hasPermission(`${user.permissionNode}.update`)
      || user.id === target.id
      || user.ownedBy.id === target.id
  }

  delete(user: User, target: User): AuthorizerResponse {
    return user.hasPermission(`${user.permissionNode}.delete`)
      || user.id === target.id
      || user.ownedBy.id === target.id
  }

  /* multiple user policies */
  list(user: User): AuthorizerResponse {
    return user.hasPermission(`${user.permissionNode}.list`)
  }
}
