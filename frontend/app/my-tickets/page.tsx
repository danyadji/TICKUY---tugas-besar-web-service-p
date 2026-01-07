'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ticketService } from '@/services/orderService';
import { authService } from '@/services/authService';

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const result = await ticketService.getUserTickets();
      if (result.success) {
        setTickets(result.data);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewTicketDetail = async (ticketId: string) => {
    try {
      const result = await ticketService.getTicketById(ticketId);
      if (result.success) {
        setSelectedTicket(result.data);
      }
    } catch (err) {
      console.error('Error loading ticket detail:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">TICKUY</h1>
          <Link href="/events" className="text-blue-600 hover:text-blue-700">
            ← Kembali ke Events
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Tiket Saya</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{ticket.event_name}</h3>
                    <p className="text-gray-600">{ticket.category_name}</p>
                    <p className="text-sm text-gray-500">No. Tiket: {ticket.nomor_tiket}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>Tanggal Event: {new Date(ticket.event_date).toLocaleDateString('id-ID')}</p>
                    <p>Lokasi: {ticket.event_location}</p>
                  </div>
                  <button
                    onClick={() => viewTicketDetail(ticket.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Lihat E-Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Anda belum memiliki tiket</p>
            <Link href="/events" className="text-blue-600 hover:underline">
              Beli Tiket Sekarang →
            </Link>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">E-Ticket</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="text-center mb-4">
              <h4 className="font-bold text-xl mb-2">{selectedTicket.event_name}</h4>
              <p className="text-gray-600 mb-1">{selectedTicket.category_name}</p>
              <p className="text-sm text-gray-500 mb-4">No: {selectedTicket.nomor_tiket}</p>
              
              {selectedTicket.qr_code_data && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <img
                    src={selectedTicket.qr_code_data}
                    alt="QR Code"
                    className="mx-auto"
                    style={{ width: '200px', height: '200px' }}
                  />
                </div>
              )}

              <div className="text-left space-y-2 text-sm">
                <p><strong>Tanggal:</strong> {new Date(selectedTicket.event_date).toLocaleDateString('id-ID')}</p>
                <p><strong>Lokasi:</strong> {selectedTicket.event_location}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${
                  selectedTicket.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
                }`}>{selectedTicket.status}</span></p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
