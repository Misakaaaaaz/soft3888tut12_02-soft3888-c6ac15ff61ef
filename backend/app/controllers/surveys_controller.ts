import type { HttpContext } from '@adonisjs/core/http'
import Survey from '#models/survey'

export default class SurveysController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return await Survey.query().preload('schools').paginate(1) // Preload related schools
    // return await Survey.query().paginate(1)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const { schools, ...surveyData } = request.only(['title', 'description', 'level', 'schools']) // Expecting schools as an array of school IDs
    // Create the survey
    const survey = await Survey.create(surveyData)
    // Attach related schools (many-to-many relationship)
    if (schools && schools.length > 0) {
      await survey.related('schools').attach(schools) // Attach school IDs to the survey
    }

    await survey.load('schools');
    return survey
    // return await Survey.create(request.all())
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Survey.query().where('id', params.id).preload('schools').firstOrFail() // Preload schools for individual survey
    // return await Survey.findOrFail(params.id)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const survey = await Survey.findOrFail(params.id)
    const { schools, ...surveyData } = request.only(['title', 'description', 'level', 'schools']) // Expecting schools as an array of school IDs
    // Update the survey fields
    survey.merge(surveyData)
    // survey.merge(request.all())
    await survey.save()
    // Sync the related schools (many-to-many relationship)
    if (schools && schools.length > 0) {
      await survey.related('schools').sync(schools) // Sync the school relationship with new IDs
    } else {
      // If no schools were provided, detach all related schools
      await survey.related('schools').detach()
    }

    return survey
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const survey = await Survey.findOrFail(params.id)
    await survey.delete()
    return survey
  }
}
