'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventService } from '@/services/eventService';
import { Navbar } from '@/components/sections';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadEvents();
    checkAuth();

    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    console.log('🔍 Checking auth - Token:', token ? '✅ exists' : '❌ null', 'User:', userStr ? '✅ exists' : '❌ null');
    
    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(userStr);
        const name = userData.nama || userData.name || 'User';
        setUserName(name);
        console.log('✅ User authenticated:', name);
      } catch (err) {
        console.error('❌ Error parsing user data:', err);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
      setUserName('');
      console.log('❌ User not authenticated');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setIsAuthenticated(false);
    setUserName('');
    router.push('/');
    console.log('👋 User logged out');
  };

  const loadEvents = async () => {
    try {
      const result = await eventService.getAllEvents({});
      if (result.success) {
        setEvents(result.data.slice(0, 8));
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  console.log('📊 Navbar State:', { isAuthenticated, userName });

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={userName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-lg bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 mb-6">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Platform ticketing terpercaya
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Cari event yang kamu suka
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Dari konser musik, workshop, hingga festival. Temukan pengalaman baru setiap hari dan pesan tiketnya dengan cepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/events"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Jelajahi Event
              </Link>
              {!isAuthenticated && (
                <Link 
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Buat Akun
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Event Terbaru</h2>
            <p className="text-slate-600 mt-1">Jangan lewatkan event menarik minggu ini</p>
          </div>
          <Link href="/events" className="text-sm font-medium text-slate-900 hover:text-slate-700 flex items-center gap-1 group">
            Lihat semua
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 rounded-lg border border-dashed border-slate-200 bg-slate-50">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg text-slate-900 font-medium">Belum ada event tersedia</p>
            <p className="text-slate-500 text-sm mt-1">Cek kembali nanti untuk event baru</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-all">
                  {/* Event Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {event.banner_url ? (
                      <img
                        src={event.banner_url}
                        alt={event.nama_event}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 leading-snug">
                      {event.nama_event}
                    </h3>

                    <div className="space-y-1.5 text-sm mb-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">
                          {new Date(event.tanggal_mulai || event.tanggal_event).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate text-sm">{event.lokasi}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="pt-3 border-t border-slate-100">
                      {event.min_price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-slate-600">Mulai</span>
                          <p className="text-lg font-semibold text-slate-900">
                            Rp{new Intl.NumberFormat('id-ID').format(event.min_price)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Harga belum tersedia</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
