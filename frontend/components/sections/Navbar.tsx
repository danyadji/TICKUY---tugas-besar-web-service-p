'use client';

import Link from 'next/link';

interface NavbarProps {
  isAuthenticated: boolean;
  userName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onLogout: () => void;
}

export function Navbar({
  isAuthenticated,
  userName,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onLogout,
}: NavbarProps) {
  console.log('🎨 Navbar Render - isAuthenticated:', isAuthenticated, 'userName:', userName);
  
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2c4a5a] to-[#5a7c8f] rounded-2xl blur-sm group-hover:blur-md transition-all opacity-50"></div>
              <div className="relative bg-gradient-to-br from-[#2c4a5a] via-[#3d5a6d] to-[#5a7c8f] p-2.5 rounded-2xl group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#2c4a5a] via-[#3d5a6d] to-[#5a7c8f] bg-clip-text text-transparent">
              TICKUY
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-2xl">
            <div className="relative group">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d5a6d] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari konser, seminar, workshop..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5a7c8f]/30 focus:border-[#5a7c8f] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
          </form>

          {/* Navigation Links */}
          <div className="flex gap-2 flex-shrink-0 items-center">
            {isAuthenticated ? (
              <>
                {/* SUDAH LOGIN - Tampilkan Buat Event, Event Saya, Transaksi, Tiket, Profil */}
                
                {/* Button Buat Event */}
                <Link
                  href="/create-event"
                  className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium transition-all rounded-lg shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-semibold">Buat Event</span>
                </Link>

                {/* Button Event Saya */}
                <Link
                  href="/my-events"
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all rounded-lg hover:bg-blue-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold">Event Saya</span>
                </Link>
                
                {/* Button Tiket */}
                <Link
                  href="/my-tickets"
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all rounded-lg hover:bg-blue-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="text-sm font-semibold">Tiket</span>
                </Link>

                {/* Dropdown Profil */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all rounded-lg hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-semibold">Profil</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base">{userName}</p>
                          <p className="text-sm text-slate-500">Member</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/my-events"
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Event Saya</span>
                      </Link>
                      <Link
                        href="/my-tickets"
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span className="font-medium">Tiket Saya</span>
                      </Link>
                      <Link
                        href="/my-orders"
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="font-medium">Pesanan Saya</span>
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* BELUM LOGIN - Tampilkan Login dan Daftar */}
                <Link
                  href="/login"
                  className="px-6 py-2.5 text-slate-700 hover:text-[#2c4a5a] font-semibold transition-all rounded-xl hover:bg-slate-100"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 text-white bg-gradient-to-r from-[#2c4a5a] via-[#3d5a6d] to-[#5a7c8f] rounded-xl hover:shadow-xl hover:shadow-[#3d5a6d]/30 transition-all font-semibold flex items-center gap-2 hover:scale-105"
                >
                  Daftar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
