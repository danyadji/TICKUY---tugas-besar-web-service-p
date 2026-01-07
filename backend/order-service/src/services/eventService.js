const axios = require('axios');

class EventService {
  static async getTicketCategory(categoryId) {
    try {
      console.log('🎫 Fetching ticket category:', categoryId);
      const url = `${process.env.EVENT_SERVICE_URL}/api/ticket-categories/${categoryId}`;
      console.log('📍 URL:', url);
      
      const response = await axios.get(url);
      console.log('✅ Category fetched:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching ticket category:', {
        categoryId,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      if (error.response && error.response.status === 404) {
        throw new Error('Kategori tiket tidak ditemukan atau sudah tidak tersedia');
      }
      throw new Error('Gagal memuat kategori tiket. Silakan coba lagi');
    }
  }

  static async getEvent(eventId) {
    try {
      const response = await axios.get(
        `${process.env.EVENT_SERVICE_URL}/api/events/${eventId}`
      );
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('Event tidak ditemukan');
      }
      throw new Error('Gagal mengambil data event');
    }
  }

  static async checkAvailability(categoryId, quantity) {
    try {
      const category = await this.getTicketCategory(categoryId);
      const available = category.kuota - category.terjual;
      
      if (available < quantity) {
        throw new Error(`Tiket tidak cukup. Tersedia: ${available}, diminta: ${quantity}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EventService;
