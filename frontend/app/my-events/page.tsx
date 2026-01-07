'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/eventService';
import Link from 'next/link';

interface Event {
  id: number;
  nama_event: string;
  deskripsi: string;
  lokasi: string;
  tanggal_mulai: string;
  status: 'draft' | 'pending' | 'published' | 'cancelled' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      const result = await eventService.getMyEvents();
      setEvents(result.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat event');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      published: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return badges[status] || badges.draft;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      published: '✅',
      rejected: '❌',
      draft: '📝',
      cancelled: '🚫'
    };
    return icons[status] || '📄';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Menunggu Approval',
      published: 'Dipublikasikan',
      rejected: 'Ditolak',
      draft: 'Draft',
      cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Saya</h1>
              <p className="text-gray-600 mt-2">Kelola semua event yang Anda buat</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/my-revenue"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
              >
                <span>💰</span> Lihat Revenue
              </Link>
              <Link
                href="/create-event"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <span>➕</span> Buat Event Baru
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Event</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">
                {events.filter(e => e.status === 'pending').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700">Published</p>
              <p className="text-2xl font-bold text-green-800">
                {events.filter(e => e.status === 'published').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-700">Ditolak</p>
              <p className="text-2xl font-bold text-red-800">
                {events.filter(e => e.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Event</h3>
            <p className="text-gray-600 mb-6">
              Anda belum membuat event apapun. Mulai buat event pertama Anda sekarang!
            </p>
            <Link
              href="/create-event"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ➕ Buat Event Pertama
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{event.nama_event}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📍 {event.lokasi}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {formatDate(event.tanggal_mulai)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(event.status)}`}>
                      {getStatusIcon(event.status)} {getStatusText(event.status)}
                    </span>
                  </div>

                  {/* Description */}
                  {event.deskripsi && (
                    <p className="text-gray-700 mb-4 line-clamp-2">{event.deskripsi}</p>
                  )}

                  {/* Status Messages */}
                  {event.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        ⏳ <strong>Event sedang direview oleh admin.</strong> Harap tunggu 1-2 hari kerja. 
                        Anda akan mendapat notifikasi jika event di-approve atau ditolak.
                      </p>
                    </div>
                  )}

                  {event.status === 'published' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Event sudah dipublikasikan!</strong> Event Anda sekarang muncul di homepage dan bisa dilihat oleh semua user.
                      </p>
                    </div>
                  )}

                  {event.status === 'rejected' && event.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800 mb-2">
                        <strong>❌ Alasan Ditolak:</strong>
                      </p>
                      <p className="text-sm text-red-700 italic">{event.rejection_reason}</p>
                      <p className="text-xs text-red-600 mt-2">
                        Perbaiki event Anda dan ajukan kembali, atau hubungi admin untuk informasi lebih lanjut.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {event.status === 'published' && (
                      <>
                        <Link
                          href={`/events/${event.id}`}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition text-center"
                        >
                          👁️ Lihat Event
                        </Link>
                        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition">
                          🎫 Kelola Tiket
                        </button>
                      </>
                    )}
                    {event.status === 'rejected' && (
                      <Link
                        href="/create-event"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition text-center"
                      >
                        🔄 Buat Event Baru
                      </Link>
                    )}
                    {event.status === 'pending' && (
                      <div className="flex-1 bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-medium text-center cursor-not-allowed">
                        ⏳ Menunggu Review
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">❓ FAQ Event Organizer</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Q: Berapa lama proses approval?</strong></p>
            <p className="mb-4">A: Admin akan review event dalam 1-2 hari kerja.</p>
            
            <p><strong>Q: Kenapa event saya ditolak?</strong></p>
            <p className="mb-4">A: Cek alasan penolakan di atas. Pastikan event memenuhi syarat: deskripsi lengkap, tanggal valid, lokasi jelas.</p>
            
            <p><strong>Q: Bisa edit event setelah diajukan?</strong></p>
            <p>A: Saat ini belum bisa. Jika ditolak, buat event baru dengan perbaikan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
