'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventService } from '@/services/eventService';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';

declare global {
  interface Window {
    snap: any;
  }
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    loadEventDetail();
    loadMidtransScript();
  }, []);

  const loadMidtransScript = () => {
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="snap.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const loadEventDetail = async () => {
    try {
      const eventResult = await eventService.getEventById(id);
      if (eventResult.success) {
        setEvent(eventResult.data);
      } else {
        alert('Event tidak ditemukan');
        router.push('/');
        return;
      }

      const categoriesResult = await eventService.getTicketCategories(id);
      console.log('Categories result:', categoriesResult);
      
      if (categoriesResult.success) {
        if (categoriesResult.data && categoriesResult.data.length > 0) {
          setCategories(categoriesResult.data);
        } else {
          console.warn('Event ini belum memiliki kategori tiket');
          // Tetap izinkan halaman dibuka, tapi tidak ada kategori
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories:', categoriesResult);
        // Jangan alert disini, biarkan user tetap bisa lihat event
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Error loading event:', err);
      alert('Gagal memuat detail event');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!selectedCategory) {
      alert('Pilih kategori tiket terlebih dahulu');
      return;
    }

    // Validasi ketersediaan tiket
    const available = selectedCategory.kuota - selectedCategory.terjual;
    if (available < quantity) {
      alert(`Tiket tidak cukup. Hanya tersedia ${available} tiket`);
      return;
    }

    if (available === 0) {
      alert('Tiket sudah habis');
      return;
    }

    setProcessing(true);
    try {
      const orderResult = await orderService.createOrder({
        event_id: parseInt(id),
        ticket_category_id: selectedCategory.id,
        quantity
      });

      if (orderResult.success && orderResult.data.snap_token) {
        const orderId = orderResult.data.order_id; // Simpan order_id
        
        window.snap.pay(orderResult.data.snap_token, {
          onSuccess: async function(result: any) {
            console.log('✅ Payment success:', result);
            // Manual check payment untuk generate tickets
            try {
              const checkResult = await orderService.manualPaymentCheck(orderId.toString());
              console.log('✅ Manual check result:', checkResult);
              alert('Pembayaran berhasil! Tiket telah dibuat.');
            } catch (err) {
              console.error('Error manual check:', err);
              alert('Pembayaran berhasil! Tiket sedang diproses.');
            }
            router.push('/my-tickets');
          },
          onPending: async function(result: any) {
            console.log('⏳ Payment pending:', result);
            alert('Menunggu pembayaran...');
            router.push('/my-tickets');
          },
          onError: function(result: any) {
            console.error('❌ Payment error:', result);
            alert('Pembayaran gagal!');
            setProcessing(false);
          },
          onClose: function() {
            console.log('🔒 Payment popup closed');
            setProcessing(false);
          }
        });
      } else {
        throw new Error('Gagal membuat order. Silakan coba lagi');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Checkout gagal';
      
      // Berikan pesan yang lebih user-friendly
      if (errorMessage.includes('kategori tiket')) {
        alert('Kategori tiket tidak ditemukan atau sudah tidak tersedia. Silakan refresh halaman.');
        setTimeout(() => window.location.reload(), 2000);
      } else if (errorMessage.includes('tidak cukup')) {
        alert(errorMessage);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert(errorMessage);
      }
      
      setProcessing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-6">
            {/* Logo */}
            <Link href="/" className="text-3xl font-bold text-blue-600 flex-shrink-0">
              TICKUY
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-11 pr-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                ← Kembali
              </button>
              {isAuthenticated && (
                <Link
                  href="/my-tickets"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  🎫 Tiket Saya
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-8">
              <div className="h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                <div className="text-9xl opacity-50">🎭</div>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                  new Date(event?.tanggal_event) > new Date() 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gray-500'
                }`}>
                  {new Date(event?.tanggal_event) > new Date() ? '🔴 UPCOMING' : '⚫ PASSED'}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event?.nama_event}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {event?.deskripsi}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 border-t border-b">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-2">📅 TANGGAL</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(event?.tanggal_event).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-2">⏰ JAM</p>
                  <p className="text-lg font-bold text-gray-900">13:00 WIB</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-2">📍 LOKASI</p>
                  <p className="text-lg font-bold text-gray-900">{event?.lokasi}</p>
                </div>
              </div>

              {/* Description Sections */}
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Tentang Event</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {event?.deskripsi}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Catatan Penting</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Hadir 15 menit sebelum acara dimulai</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Bawa tiket dalam bentuk digital atau cetak</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Tiket tidak dapat dibatalkan atau ditukar</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Jaminan uang kembali jika acara dibatalkan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pilih Tiket</h2>

              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-3">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Tiket Belum Tersedia</p>
                  <p className="text-gray-400 text-sm">Event ini belum memiliki kategori tiket</p>
                </div>
              ) : (
                <div className="space-y-2.5 mb-5">
                  {categories.map((cat) => {
                    const available = cat.kuota - cat.terjual;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => available > 0 && setSelectedCategory(cat)}
                        className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCategory?.id === cat.id
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : available > 0
                            ? 'border-gray-200 hover:border-blue-300'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <h3 className="font-bold text-gray-900 text-base">{cat.nama_kategori}</h3>
                          {available <= 5 && available > 0 && (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              Sisa {available}
                            </span>
                          )}
                          {available === 0 && (
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Habis
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Tersedia: <span className="font-semibold">{available}</span> tiket
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          Rp {parseInt(cat.harga).toLocaleString('id-ID')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedCategory && (
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Jumlah Tiket
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-lg font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedCategory.kuota - selectedCategory.terjual}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => quantity < (selectedCategory.kuota - selectedCategory.terjual) && setQuantity(quantity + 1)}
                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2 py-4 border-t border-b mb-4">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Harga per tiket</span>
                      <span>Rp {parseInt(selectedCategory.harga).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Jumlah</span>
                      <span>× {quantity}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-bold text-gray-900 text-sm">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        Rp {(selectedCategory.harga * quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all text-sm flex items-center justify-center gap-2 ${
                      processing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        💳 {isAuthenticated ? 'Bayar Sekarang' : 'Login untuk Membeli'}
                      </>
                    )}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-center text-xs text-gray-600 mt-3">
                      Silakan login terlebih dahulu untuk melanjutkan pembelian
                    </p>
                  )}
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Pembayaran aman dengan Midtrans</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Tiket instant setelah pembayaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Bisa ditampilkan lewat HP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
