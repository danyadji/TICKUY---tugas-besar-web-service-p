'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register(formData);
      if (result.success) {
        alert('✅ Registrasi berhasil! Silakan login dengan akun Anda.');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Left Side - Brand */}
      <div className="hidden md:flex md:w-1/2 lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-green-600 via-blue-600 to-blue-700 rounded-l-3xl p-12 text-white">
        <div className="text-center">
          <div className="text-7xl mb-6">🎫</div>
          <h1 className="text-5xl font-bold mb-4">TICKUY</h1>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan jutaan pengguna
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <span>Akses ribuan event terbaik</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span>Temukan event yang Anda sukai</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <span>Notifikasi event favorit Anda</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💙</span>
              <span>Gratis 100% tanpa biaya tersembunyi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full md:w-1/2 lg:w-1/2 bg-white rounded-r-3xl md:rounded-none shadow-2xl md:shadow-none p-8 md:p-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex md:hidden justify-center mb-6">
              <div className="text-6xl">🎫</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akun Baru</h2>
            <p className="text-gray-600">
              Mulai jelajahi ribuan event menakjubkan
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm">
                👤 Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dany Kurniawan"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                required
              />
            </div>

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

            {/* Phone Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm">
                📱 Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08123456789"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3 text-sm">
                🔐 Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password harus minimal 6 karakter
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sedang Mendaftar...
                </>
              ) : (
                <>
                  🚀 Daftar Sekarang
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

          {/* Login Link */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 text-center text-sm">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-bold transition underline"
              >
                Masuk di sini
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

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Dengan mendaftar, Anda setuju dengan{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
