import { orderApi } from '@/lib/api';

export const orderService = {
  async createOrder(data: { event_id: number; ticket_category_id: number; quantity: number }) {
    const response = await orderApi.post('/api/orders', data);
    return response.data;
  },

  async getUserOrders() {
    const response = await orderApi.get('/api/orders');
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await orderApi.get(`/api/orders/${id}`);
    return response.data;
  },

  async getPaymentStatus(orderId: string) {
    const response = await orderApi.get(`/api/payments/status/${orderId}`);
    return response.data;
  },

  async manualPaymentCheck(orderId: string) {
    const response = await orderApi.post(`/api/payments/manual-check/${orderId}`);
    return response.data;
  }
};

export const ticketService = {
  async getUserTickets() {
    const response = await orderApi.get('/api/tickets');
    return response.data;
  },

  async getTicketById(id: string) {
    const response = await orderApi.get(`/api/tickets/${id}`);
    return response.data;
  },

  async validateTicket(ticketId: number) {
    const response = await orderApi.post('/api/tickets/validate', { ticket_id: ticketId });
    return response.data;
  }
};
