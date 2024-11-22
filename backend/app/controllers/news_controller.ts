import type { HttpContext } from '@adonisjs/core/http'
import New from '#models/new'

export default class NewsController {

  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return await New.query().preload('schools').paginate(1) // Preload related schools
  }


  async store({ request }: HttpContext) {
    const { schools, ...newsData } = request.only(['title', 'date', 'url', 'schools']) // Expecting schools as an array of school IDs

    const news = await New.create(newsData)

    // Attach related schools (many-to-many relationship)
    if (schools && schools.length > 0) {
      await news.related('schools').attach(schools) // Attach school IDs to the notification
    }

    return news
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await New.query().where('id', params.id).preload('schools').firstOrFail() // Preload schools for individual notificaiton
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const news = await New.findOrFail(params.id)

    const { schools, ...newsData } = request.only(['title', 'date', 'url', 'schools'])

    // Update the notification fields
    news.merge(newsData)
    await news.save()

    // Sync the related schools (many-to-many relationship)
    if (schools && schools.length > 0) {
      await news.related('schools').sync(schools) // Sync the school relationship with new IDs
    } else {
      // If no schools were provided, detach all related schools
      await news.related('schools').detach()
    }

    return news
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const newItem = await New.findOrFail(params.id)
    await newItem.delete()
    return newItem
  }
}
