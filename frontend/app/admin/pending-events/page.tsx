'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/eventService';
import Link from 'next/link';

interface PendingEvent {
  id: number;
  nama_event: string;
  deskripsi: string;
  lokasi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  banner_url: string;
  status: string;
  created_by: number;
  created_at: string;
  creator_name?: string;
  creator_email?: string;
}

export default function AdminPendingEventsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const loadPendingEvents = async () => {
    try {
      const result = await eventService.getPendingEvents();
      setEvents(result.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat event pending');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: number, eventName: string) => {
    if (!confirm(`Approve event "${eventName}"?\n\nEvent akan dipublikasikan dan muncul di homepage.`)) {
      return;
    }

    setActionLoading(eventId);
    try {
      await eventService.approveEvent(eventId.toString());
      alert('✅ Event berhasil di-approve!');
      loadPendingEvents(); // Reload list
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.message || 'Gagal approve event'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId: number, eventName: string) => {
    const reason = prompt(
      `Reject event "${eventName}"?\n\nMasukkan alasan penolakan:`,
      'Event tidak memenuhi syarat'
    );

    if (!reason) return;

    setActionLoading(eventId);
    try {
      await eventService.rejectEvent(eventId.toString(), reason);
      alert('❌ Event berhasil ditolak!');
      loadPendingEvents(); // Reload list
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.message || 'Gagal reject event'));
    } finally {
      setActionLoading(null);
    }
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
          <p className="text-gray-600">Memuat event pending...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Event Pending</h1>
              <p className="text-gray-600 mt-2">
                Approve atau reject event yang diajukan oleh event organizer
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <div className="text-4xl">⏳</div>
            <div>
              <p className="text-sm text-yellow-700 font-medium">Event Menunggu Review</p>
              <p className="text-2xl font-bold text-yellow-900">{events.length}</p>
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
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Semua Event Sudah Direview</h3>
            <p className="text-gray-600">
              Tidak ada event pending yang perlu direview saat ini. Good job! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.nama_event}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          📍 {event.lokasi}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {formatDate(event.tanggal_mulai)}
                        </span>
                      </div>
                      
                      {/* Organizer Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
                        <p className="text-xs text-blue-700 font-medium mb-1">Diajukan oleh:</p>
                        <p className="font-semibold text-blue-900">
                          {event.creator_name || `User ID: ${event.created_by}`}
                        </p>
                        {event.creator_email && (
                          <p className="text-sm text-blue-700">{event.creator_email}</p>
                        )}
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDate(event.created_at)}
                        </p>
                      </div>
                    </div>

                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-sm font-semibold">
                      ⏳ Pending Review
                    </span>
                  </div>

                  {/* Event Description */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Deskripsi Event:</h4>
                    <p className="text-gray-700 whitespace-pre-line">{event.deskripsi || 'Tidak ada deskripsi'}</p>
                  </div>

                  {/* Banner Preview */}
                  {event.banner_url && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Banner:</h4>
                      <img
                        src={event.banner_url}
                        alt={event.nama_event}
                        className="w-full max-w-2xl h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Banner+Not+Found';
                        }}
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tanggal Mulai</p>
                      <p className="font-semibold text-gray-900">{formatDate(event.tanggal_mulai)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tanggal Selesai</p>
                      <p className="font-semibold text-gray-900">{formatDate(event.tanggal_selesai)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(event.id, event.nama_event)}
                      disabled={actionLoading === event.id}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {actionLoading === event.id ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          ✅ Approve & Publish
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(event.id, event.nama_event)}
                      disabled={actionLoading === event.id}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {actionLoading === event.id ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          ❌ Reject Event
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guidelines */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📋 Kriteria Review Event</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">✅ Approve jika:</h4>
              <ul className="space-y-1 pl-4">
                <li>• Nama event jelas dan profesional</li>
                <li>• Deskripsi lengkap dan informatif</li>
                <li>• Tanggal event valid (di masa depan)</li>
                <li>• Lokasi spesifik dan jelas</li>
                <li>• Banner berkualitas (jika ada)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">❌ Reject jika:</h4>
              <ul className="space-y-1 pl-4">
                <li>• Event spam atau palsu</li>
                <li>• Deskripsi tidak jelas</li>
                <li>• Tanggal sudah lewat</li>
                <li>• Konten tidak pantas</li>
                <li>• Duplikasi event</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
