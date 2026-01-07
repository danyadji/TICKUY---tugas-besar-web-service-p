'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState<number | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async (orderId: number) => {
    try {
      setCheckingPayment(orderId);
      const result = await orderService.manualPaymentCheck(orderId.toString());
      
      if (result.success) {
        alert('Pembayaran berhasil! Tiket telah dibuat.');
        loadOrders(); // Reload orders
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memeriksa pembayaran');
    } finally {
      setCheckingPayment(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">TICKUY</h1>
          <div className="flex gap-4">
            <Link href="/my-tickets" className="text-blue-600 hover:text-blue-700">
              Tiket Saya
            </Link>
            <Link href="/events" className="text-blue-600 hover:text-blue-700">
              Events
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Pesanan Saya</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">Order #{order.order_number}</h3>
                    <p className="text-gray-600">
                      {order.quantity} tiket × Rp {order.total_amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {order.status === 'PENDING' && order.expired_at && (
                      <p className="text-orange-600">
                        Kadaluarsa: {new Date(order.expired_at).toLocaleString('id-ID')}
                      </p>
                    )}
                    {order.status === 'PAID' && (
                      <p className="text-green-600">✓ Pembayaran berhasil</p>
                    )}
                  </div>
                  
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => checkPayment(order.id)}
                      disabled={checkingPayment === order.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {checkingPayment === order.id ? 'Checking...' : 'Check Payment (Dev)'}
                    </button>
                  )}
                  
                  {order.status === 'PAID' && (
                    <Link
                      href="/my-tickets"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Lihat Tiket
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Anda belum memiliki pesanan</p>
            <Link href="/events" className="text-blue-600 hover:underline">
              Beli Tiket Sekarang →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
