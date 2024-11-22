import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'
import User from '#models/user'

export default class SchoolsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return await School.query().paginate(1)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    return await db.transaction(async (trx) => {
      let school = new School()
      school.useTransaction(trx)
      school.merge(request.all())
      await school.save()

      // handle admin users
      if (request.input('adminUser')) {
        const adminUser = await User.query({ client: trx })
          .where('id', request.input('adminUser'))
          .firstOrFail()
        await school.related('adminUser').associate(adminUser)
      }

      return school
    })
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await School.query().preload('adminUser').preload('surveys').where('id', params.id).firstOrFail()
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    return await db.transaction(async (trx) => {
      const school = await School.query({ client: trx }).where('id', params.id).firstOrFail()
      school.useTransaction(trx)
      school.merge(request.all())
      await school.save()

      // handle admin users
      if (request.input('adminUser')) {
        const adminUser = await User.query({ client: trx })
          .where('id', request.input('adminUser'))
          .firstOrFail()
        await school.related('adminUser').associate(adminUser)
      }

      return school
    })
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const school = await School.findOrFail(params.id)
    await school.delete()
    return school
  }
}
