export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Event {
  id: number;
  nama_event: string;
  deskripsi: string;
  tanggal_event: string;
  lokasi: string;
  status: 'aktif' | 'selesai' | 'dibatalkan';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TicketCategory {
  id: number;
  event_id: number;
  nama_kategori: string;
  harga: string;
  kuota: number;
  terjual: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  event_id: number;
  ticket_category_id: number;
  nomor_order: string;
  jumlah_tiket: number;
  total_harga: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
  event_name?: string;
  category_name?: string;
  user_email?: string;
}

export interface Payment {
  id: number;
  order_id: number;
  midtrans_order_id: string;
  snap_token: string;
  snap_redirect_url: string;
  payment_type: string | null;
  gross_amount: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  midtrans_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  order_id: number;
  user_id: number;
  event_id: number;
  ticket_category_id: number;
  nomor_tiket: string;
  qr_code_data: string | null;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  scanned_at: string | null;
  scanned_by: number | null;
  created_at: string;
  event_name?: string;
  event_date?: string;
  event_location?: string;
  category_name?: string;
  user_name?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
