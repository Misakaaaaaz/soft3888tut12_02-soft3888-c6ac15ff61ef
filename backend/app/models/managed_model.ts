import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ManagedModel extends BaseModel {
  permissionNode = this.constructor.name.toLowerCase()

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => JSON.parse(value),
    serializeAs: null,
  })
  declare permissionMetadata: string[]

  @computed()
  get permissions() {
    return this.permissionMetadata
  }

  @belongsTo(() => User)
  declare ownedBy: BelongsTo<typeof User>
}
