'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventService } from '@/services/eventService';
import Link from 'next/link';

interface TicketCategory {
  nama_kategori: string;
  harga: string;
  kuota: string;
  deskripsi: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_event: '',
    deskripsi: '',
    lokasi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    banner_url: ''
  });
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([
    { nama_kategori: 'VIP', harga: '', kuota: '', deskripsi: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validasi kategori tiket
      const validCategories = ticketCategories.filter(
        cat => cat.nama_kategori && cat.harga && cat.kuota
      );

      if (validCategories.length === 0) {
        setError('Minimal harus ada 1 kategori tiket yang lengkap!');
        setLoading(false);
        return;
      }

      // Buat event dulu - konversi format tanggal untuk MySQL
      const eventData = {
        ...formData,
        tanggal_mulai: formData.tanggal_mulai.replace('T', ' ') + ':00',
        tanggal_selesai: formData.tanggal_selesai.replace('T', ' ') + ':00'
      };
      
      const eventResult = await eventService.createEventByUser(eventData);
      const eventId = eventResult.data.id;

      // Tambahkan kategori tiket
      for (const category of validCategories) {
        await eventService.createTicketCategory({
          event_id: eventId,
          nama_kategori: category.nama_kategori,
          harga: parseFloat(category.harga),
          kuota: parseInt(category.kuota),
          deskripsi: category.deskripsi || '',
          status: 'available'
        });
      }

      alert('✅ Event berhasil diajukan! Menunggu approval admin.');
      router.push('/my-events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addTicketCategory = () => {
    setTicketCategories([
      ...ticketCategories,
      { nama_kategori: '', harga: '', kuota: '', deskripsi: '' }
    ]);
  };

  const removeTicketCategory = (index: number) => {
    setTicketCategories(ticketCategories.filter((_, i) => i !== index));
  };

  const updateTicketCategory = (index: number, field: keyof TicketCategory, value: string) => {
    const updated = [...ticketCategories];
    updated[index][field] = value;
    setTicketCategories(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 untuk preview only
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);

      // Upload ke ImgBB (free image hosting)
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      try {
        const response = await fetch('https://api.imgbb.com/1/upload?key=46c0b26877faa31384840def2842c676', {
          method: 'POST',
          body: uploadFormData
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFormData(prev => ({ ...prev, banner_url: data.data.url }));
            alert('✅ Gambar berhasil diupload!');
          } else {
            throw new Error('Upload failed');
          }
        } else {
          throw new Error('Upload failed');
        }
      } catch (uploadErr) {
        console.error('Upload to ImgBB failed:', uploadErr);
        alert('Gagal upload gambar ke server. Silakan gunakan URL gambar dari internet saja.');
        setFormData(prev => ({ ...prev, banner_url: '' }));
        setImagePreview('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal memproses gambar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Kembali ke Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Buat Event Baru</h1>
          <p className="text-gray-600">
            Isi form di bawah untuk mendaftarkan event Anda. Event akan direview oleh admin sebelum dipublikasikan.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Event */}
            <div>
              <label htmlFor="nama_event" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_event"
                name="nama_event"
                required
                minLength={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.nama_event}
                onChange={handleChange}
                placeholder="Konser Musik Indie Jakarta 2026"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Event <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Deskripsikan event Anda secara detail: lineup, fasilitas, dresscode, dll..."
              />
            </div>

            {/* Lokasi */}
            <div>
              <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lokasi"
                name="lokasi"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.lokasi}
                onChange={handleChange}
                placeholder="Jakarta Convention Center, Hall A"
              />
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="tanggal_mulai"
                  name="tanggal_mulai"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="tanggal_selesai" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="tanggal_selesai"
                  name="tanggal_selesai"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Event <span className="text-gray-400">(Optional)</span>
              </label>
              
              {/* Preview */}
              {(imagePreview || formData.banner_url) && (
                <div className="mb-4 relative">
                  <img
                    src={imagePreview || formData.banner_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, banner_url: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 font-medium">
                      {uploading ? 'Uploading...' : 'Klik untuk upload banner'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <div className="text-sm text-gray-500">atau</div>

                <div className="flex-1">
                  <input
                    type="url"
                    id="banner_url"
                    name="banner_url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.banner_url}
                    onChange={handleChange}
                    placeholder="Paste URL gambar"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Upload langsung atau paste URL dari hosting gambar (Imgur, Cloudinary, dll)
              </p>
            </div>

            {/* Kategori Tiket */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kategori Tiket</h3>
                  <p className="text-sm text-gray-600">Tambahkan minimal 1 kategori tiket dengan harga</p>
                </div>
                <button
                  type="button"
                  onClick={addTicketCategory}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Kategori
                </button>
              </div>

              <div className="space-y-4">
                {ticketCategories.map((category, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700">Kategori #{index + 1}</h4>
                      {ticketCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketCategory(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={category.nama_kategori}
                          onChange={(e) => updateTicketCategory(index, 'nama_kategori', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="VIP, Tribun Barat, Regular, dll"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={category.harga}
                          onChange={(e) => updateTicketCategory(index, 'harga', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100000"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kuota <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={category.kuota}
                          onChange={(e) => updateTicketCategory(index, 'kuota', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={category.deskripsi}
                          onChange={(e) => updateTicketCategory(index, 'deskripsi', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Akses ke semua area"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span> Proses Approval
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Event Anda akan direview oleh admin dalam 1-2 hari kerja</li>
                <li>• Anda akan dapat melihat status di halaman "Event Saya"</li>
                <li>• Setelah approved, event akan muncul di homepage</li>
                <li>• Anda bisa tambahkan kategori tiket setelah event di-approve</li>
                <li>• Maksimal 10 event pending per user</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mengirim...
                  </span>
                ) : (
                  '🚀 Ajukan Event'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-purple-900 mb-3">💡 Tips Agar Event Di-Approve:</h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>✅ Gunakan nama event yang jelas dan profesional</li>
            <li>✅ Tulis deskripsi lengkap (min 100 karakter)</li>
            <li>✅ Pastikan tanggal event di masa depan</li>
            <li>✅ Cantumkan lokasi yang spesifik</li>
            <li>✅ Gunakan banner berkualitas tinggi (1200x600px)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
