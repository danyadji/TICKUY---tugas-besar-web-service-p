'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventService } from '@/services/eventService';
import { authService } from '@/services/authService';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama_event: '',
    deskripsi: '',
    tanggal_event: '',
    lokasi: '',
    status: 'aktif'
  });

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      router.push('/login');
      return;
    }
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const result = await eventService.getAllEvents({});
      if (result.success) {
        setEvents(result.data);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, formData);
        alert('Event berhasil diupdate');
      } else {
        await eventService.createEvent(formData);
        alert('Event berhasil dibuat');
      }
      setShowForm(false);
      setEditingEvent(null);
      setFormData({ nama_event: '', deskripsi: '', tanggal_event: '', lokasi: '', status: 'aktif' });
      loadEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan event');
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      nama_event: event.nama_event,
      deskripsi: event.deskripsi,
      tanggal_event: event.tanggal_event.split('T')[0],
      lokasi: event.lokasi,
      status: event.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin hapus event ini?')) {
      try {
        await eventService.deleteEvent(id);
        alert('Event berhasil dihapus');
        loadEvents();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus event');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TICKUY Admin</h1>
          <Link href="/admin/dashboard" className="hover:text-blue-200">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Kelola Event</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Tambah Event
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Nama Event</th>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">Lokasi</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t">
                  <td className="px-6 py-4">{event.nama_event}</td>
                  <td className="px-6 py-4">{new Date(event.tanggal_event).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">{event.lokasi}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      event.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {editingEvent ? 'Edit Event' : 'Tambah Event'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nama Event</label>
                <input
                  type="text"
                  value={formData.nama_event}
                  onChange={(e) => setFormData({ ...formData, nama_event: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Tanggal Event</label>
                <input
                  type="date"
                  value={formData.tanggal_event}
                  onChange={(e) => setFormData({ ...formData, tanggal_event: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                    setFormData({ nama_event: '', deskripsi: '', tanggal_event: '', lokasi: '', status: 'aktif' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
