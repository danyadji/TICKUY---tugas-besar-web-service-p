'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(formData.email, formData.password);
      if (result.success) {
        const user = result.data.user;
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // Force reload untuk trigger checkAuth() di home page
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Left Side - Brand */}
      <div className="hidden md:flex md:w-1/2 lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-l-3xl p-12 text-white">
        <div className="text-center">
          <div className="text-7xl mb-6">🎭</div>
          <h1 className="text-5xl font-bold mb-4">TICKUY</h1>
          <p className="text-xl text-blue-100 mb-8">
            Platform Tiket Online Terpercaya
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎫</span>
              <span>Tiket event dari berbagai kategori</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <span>Pembayaran aman dengan enkripsi</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span>Tiket instant setelah pembayaran</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <span>Akses tiket dari mana saja</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-1/2 bg-white rounded-r-3xl md:rounded-none shadow-2xl md:shadow-none p-8 md:p-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex md:hidden justify-center mb-6">
              <div className="text-6xl">🎭</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk ke TICKUY</h2>
            <p className="text-gray-600">
              Akses akun Anda untuk membeli dan kelola tiket
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-800">Gagal Login</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm">
                📧 Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm">
                🔐 Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Lupa password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  🚀 Masuk Sekarang
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-700 mb-3 font-semibold">
              🧪 Demo Account (untuk testing):
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <p className="font-mono text-blue-600">Email: user@test.com</p>
                <p className="font-mono text-blue-600">Pass: password123</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-mono text-purple-600">Admin Email: admin@test.com</p>
                <p className="font-mono text-purple-600">Admin Pass: admin123</p>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 text-center text-sm">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-bold transition underline"
              >
                Daftar Gratis
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
