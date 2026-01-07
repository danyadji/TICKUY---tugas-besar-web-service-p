'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      router.push('/login');
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success) {
        const orders = result.data;
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
          paidOrders: orders.filter((o: any) => o.status === 'PAID').length,
          totalRevenue: orders
            .filter((o: any) => o.status === 'PAID')
            .reduce((sum: number, o: any) => sum + parseFloat(o.total_harga), 0)
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TICKUY Admin</h1>
          <div className="flex gap-4">
            <Link href="/admin/pending-events" className="hover:text-blue-200">Review Events</Link>
            <Link href="/admin/events" className="hover:text-blue-200">Events</Link>
            <Link href="/admin/orders" className="hover:text-blue-200">Orders</Link>
            <Link href="/admin/scan" className="hover:text-blue-200">Scan QR</Link>
            <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">Paid</p>
            <p className="text-3xl font-bold text-green-600">{stats.paidOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600">
              Rp {stats.totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/pending-events"
            className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-bold mb-2">Review Event Pending</h3>
            <p className="text-yellow-100">Approve/reject event dari organizer</p>
          </Link>

          <Link
            href="/admin/events"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-bold mb-2">Kelola Event</h3>
            <p className="text-gray-600">Tambah, edit, dan hapus event</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Kelola Order</h3>
            <p className="text-gray-600">Pantau status pembayaran</p>
          </Link>

          <Link
            href="/admin/scan"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-xl font-bold mb-2">Scan QR Tiket</h3>
            <p className="text-gray-600">Validasi tiket pengunjung</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
