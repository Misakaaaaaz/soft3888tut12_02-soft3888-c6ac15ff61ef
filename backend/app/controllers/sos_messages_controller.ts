import type { HttpContext } from '@adonisjs/core/http'
import SosMessage from '#models/sos_message'

export default class SosMessagesController {
  /**
   * Display a list of resources with pagination
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1);  
    const limit = 10; 
    const sosMessages = await SosMessage.query().paginate(page, limit);
    return sosMessages;
  }

  async store({ request }: HttpContext) {
    try {
      const sosMessageData = request.only(['name', 'email', 'school', 'contact', 'batch']);

      const sosMessage = await SosMessage.create(sosMessageData);
  
      return sosMessage;
    } catch (error) {
      console.error('Error creating SOS message:', error);
      throw error;
    }
  }
  
  /**
   * Show an individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const sosMessage = await SosMessage.findOrFail(params.id);
      return sosMessage;
    } catch (error) {
      return response.status(404).json({ message: 'SOS message not found' });
    }
  }

  /**
   * Handle form submission for updating an existing record
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const sosMessage = await SosMessage.findOrFail(params.id);
      const data = request.only(['name', 'email', 'school', 'contact', 'batch']); 
      sosMessage.merge(data);
      await sosMessage.save();
      return response.status(200).json(sosMessage);
    } catch (error) {
      console.error('Error updating SOS message:', error);
      return response.status(500).json({ message: 'Failed to update SOS message', error });
    }
  }

  /**
   * Delete an individual record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const sosMessage = await SosMessage.findOrFail(params.id);
      await sosMessage.delete();
      return response.status(200).json({ message: 'SOS message deleted successfully' });
    } catch (error) {
      console.error('Error deleting SOS message:', error);
      return response.status(500).json({ message: 'Failed to delete SOS message', error });
    }
  }
}
