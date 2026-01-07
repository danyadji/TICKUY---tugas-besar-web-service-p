import { eventApi } from '@/lib/api';

export const eventService = {
  async getAllEvents(params?: { status?: string; search?: string }) {
    const response = await eventApi.get('/api/events', { params: params || {} });
    return response.data;
  },

  async getEventById(id: string) {
    const response = await eventApi.get(`/api/events/${id}`);
    return response.data;
  },

  async createEvent(data: any) {
    const response = await eventApi.post('/api/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: any) {
    const response = await eventApi.put(`/api/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string) {
    const response = await eventApi.delete(`/api/events/${id}`);
    return response.data;
  },

  async getTicketCategories(eventId: string) {
    const response = await eventApi.get(`/api/ticket-categories?event_id=${eventId}`);
    return response.data;
  },

  async createTicketCategory(data: any) {
    // Gunakan endpoint organizer untuk user biasa
    const response = await eventApi.post('/api/ticket-categories/organizer', data);
    return response.data;
  },

  async updateTicketCategory(id: string, data: any) {
    const response = await eventApi.put(`/api/ticket-categories/${id}`, data);
    return response.data;
  },

  async deleteTicketCategory(id: string) {
    const response = await eventApi.delete(`/api/ticket-categories/${id}`);
    return response.data;
  },

  // User create event (pending approval)
  async createEventByUser(data: any) {
    const response = await eventApi.post('/api/events/organizer', data);
    return response.data;
  },

  // Get my events
  async getMyEvents() {
    const response = await eventApi.get('/api/events/my-events');
    return response.data;
  },

  // Admin approve event
  async approveEvent(id: string) {
    const response = await eventApi.put(`/api/events/${id}/approve`);
    return response.data;
  },

  // Admin reject event
  async rejectEvent(id: string, reason: string) {
    const response = await eventApi.put(`/api/events/${id}/reject`, { reason });
    return response.data;
  },

  // Admin get pending events
  async getPendingEvents() {
    const response = await eventApi.get('/api/events/pending');
    return response.data;
  },

  // Get my revenue (organizer)
  async getMyRevenue() {
    const response = await eventApi.get('/api/revenue/my-revenue');
    return response.data;
  }
};
