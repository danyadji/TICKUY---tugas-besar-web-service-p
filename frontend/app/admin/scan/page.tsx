'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import { ticketService } from '@/services/orderService';
import { authService } from '@/services/authService';

export default function AdminScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      router.push('/login');
      return;
    }

    return () => {
      if (scanner) {
        scanner.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      setScanner(html5QrCode);
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );
      
      setScanning(true);
      setError('');
    } catch (err) {
      setError('Gagal memulai kamera. Pastikan izin kamera diberikan.');
      console.error('Error starting scanner:', err);
    }
  };

  const stopScanning = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      const qrData = JSON.parse(decodedText);
      const ticketId = qrData.ticket_id;
      
      if (!ticketId) {
        setError('QR Code tidak valid');
        return;
      }

      const validateResult = await ticketService.validateTicket(ticketId);
      
      if (validateResult.success) {
        setResult({
          success: true,
          ticket: validateResult.data
        });
        await stopScanning();
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Validasi gagal'
      });
      await stopScanning();
    }
  };

  const onScanError = (error: any) => {
    // Ignore scan errors (normal when no QR detected)
  };

  const resetScan = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TICKUY Admin</h1>
          <Link href="/admin/dashboard" className="hover:text-blue-200">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Scan QR Tiket</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div id="qr-reader" className="mb-4"></div>
            
            {!scanning ? (
              <button
                onClick={startScanning}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Mulai Scan
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                Stop Scan
              </button>
            )}
          </div>
        )}

        {result && (
          <div className={`rounded-lg shadow-md p-6 ${
            result.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
          }`}>
            {result.success ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">✓</div>
                  <h3 className="text-2xl font-bold text-green-700">Tiket Valid!</h3>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4 space-y-2">
                  <p><strong>No. Tiket:</strong> {result.ticket.nomor_tiket}</p>
                  <p><strong>Event:</strong> {result.ticket.event_name}</p>
                  <p><strong>Kategori:</strong> {result.ticket.category_name}</p>
                  <p><strong>Pemilik:</strong> {result.ticket.user_name}</p>
                  <p><strong>Status:</strong> <span className="text-green-600 font-semibold">{result.ticket.status}</span></p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">✗</div>
                  <h3 className="text-2xl font-bold text-red-700">Validasi Gagal</h3>
                  <p className="text-red-600 mt-2">{result.message}</p>
                </div>
              </>
            )}

            <button
              onClick={resetScan}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Scan Tiket Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
