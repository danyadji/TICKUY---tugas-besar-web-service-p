'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventService } from '@/services/eventService';
import { useRouter } from 'next/navigation';

export default function MyRevenuePage() {
  const router = useRouter();
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenue();
  }, []);

  const loadRevenue = async () => {
    try {
      const result = await eventService.getMyRevenue();
      if (result.success) {
        setRevenue(result.data);
      }
    } catch (err) {
      console.error('Error loading revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/my-events" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Kembali ke Event Saya
          </Link>
          <h1 className="text-3xl font-bold mb-2">💰 Revenue Saya</h1>
          <p className="text-gray-600">Pendapatan dari penjualan tiket event Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-blue-100 text-sm mb-1">Total Pendapatan</p>
            <p className="text-3xl font-bold">
              Rp {new Intl.NumberFormat('id-ID').format(revenue?.total_revenue || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-green-100 text-sm mb-1">Pendapatan Bersih (90%)</p>
            <p className="text-3xl font-bold">
              Rp {new Intl.NumberFormat('id-ID').format(revenue?.net_revenue || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-purple-100 text-sm mb-1">Tiket Terjual</p>
            <p className="text-3xl font-bold">{revenue?.total_tickets_sold || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-orange-100 text-sm mb-1">Fee Platform (10%)</p>
            <p className="text-3xl font-bold">
              Rp {new Intl.NumberFormat('id-ID').format(revenue?.platform_fee || 0)}
            </p>
          </div>
        </div>

        {/* Revenue per Event */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Revenue per Event</h2>

          {revenue?.events && revenue.events.length > 0 ? (
            <div className="space-y-4">
              {revenue.events.map((event: any) => (
                <div key={event.event_id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{event.nama_event}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        Rp {new Intl.NumberFormat('id-ID').format(event.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">{event.tickets_sold} tiket terjual</p>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Detail Kategori:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {event.categories.map((cat: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{cat.nama_kategori}</p>
                              <p className="text-xs text-gray-500">
                                Rp {new Intl.NumberFormat('id-ID').format(cat.harga)} × {cat.terjual} sold
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                Rp {new Intl.NumberFormat('id-ID').format(cat.revenue)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {cat.terjual}/{cat.kuota}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada penjualan tiket</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Platform fee sebesar 10% dari setiap transaksi</li>
            <li>• Revenue yang ditampilkan adalah dari tiket yang sudah PAID</li>
            <li>• Pencairan dana dilakukan setiap tanggal 1 dan 15</li>
            <li>• Pastikan rekening bank Anda sudah terdaftar untuk pencairan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
