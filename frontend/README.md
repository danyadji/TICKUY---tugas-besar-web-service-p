# TICKUY Frontend - Next.js Application

## Struktur Folder

```
frontend/
├── app/
│   ├── page.tsx                    # Homepage landing
│   ├── login/page.tsx              # Login page
│   ├── register/page.tsx           # Register page
│   ├── events/
│   │   ├── page.tsx                # Event list
│   │   └── [id]/page.tsx           # Event detail + checkout
│   ├── my-tickets/page.tsx         # User tickets + e-ticket QR
│   └── admin/
│       ├── dashboard/page.tsx      # Admin dashboard
│       ├── events/page.tsx         # Kelola events
│       ├── orders/page.tsx         # Kelola orders
│       └── scan/page.tsx           # Scan QR ticket
├── services/
│   ├── authService.ts              # Auth API calls
│   ├── eventService.ts             # Event API calls
│   └── orderService.ts             # Order & Ticket API calls
├── lib/
│   └── api.ts                      # Axios config + interceptors
├── types/
│   └── index.ts                    # TypeScript interfaces
└── .env.local                      # Environment variables
```

## Teknologi

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** - HTTP client
- **js-cookie** - JWT storage
- **html5-qrcode** - QR scanner
- **Midtrans Snap** - Payment gateway

## Instalasi

```bash
cd frontend
npm install
```

## Environment Variables

Update `.env.local`:
```
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_EVENT_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_KEY
```

## Run Development

```bash
npm run dev
```

Buka http://localhost:3000

## User Flow

1. **Register/Login** → `/register` atau `/login`
2. **Lihat Events** → `/events`
3. **Pilih Event** → `/events/[id]`
4. **Checkout** → Pilih kategori tiket, jumlah, bayar via Midtrans Snap
5. **E-Ticket** → `/my-tickets` (lihat QR code)

## Admin Flow

1. **Login Admin** → `/login` (dengan akun admin)
2. **Dashboard** → `/admin/dashboard`
3. **Kelola Event** → `/admin/events`
4. **Pantau Order** → `/admin/orders`
5. **Scan QR** → `/admin/scan` (validasi tiket)

## API Integration

### Auth Service
```typescript
authService.login(email, password)
authService.register(data)
authService.getProfile()
authService.logout()
```

### Event Service
```typescript
eventService.getAllEvents({ status, search })
eventService.getEventById(id)
eventService.createEvent(data)  // admin
eventService.getTicketCategories(eventId)
```

### Order Service
```typescript
orderService.createOrder({ event_id, ticket_category_id, quantity })
orderService.getUserOrders()
ticketService.getUserTickets()
ticketService.getTicketById(id)
ticketService.validateTicket(ticketId)  // admin
```

## Midtrans Integration

Contoh di `/events/[id]`:

```typescript
// Load script
const script = document.createElement('script');
script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);

// Checkout
const result = await orderService.createOrder(data);
window.snap.pay(result.data.snap_token, {
  onSuccess: () => router.push('/my-tickets'),
  onPending: () => router.push('/my-tickets'),
  onError: () => alert('Pembayaran gagal')
});
```

## QR Code

### User - Tampilkan QR
```typescript
// Ticket detail
<img src={ticket.qr_code_data} alt="QR Code" />
```

### Admin - Scan QR
```typescript
// html5-qrcode scanner
const html5QrCode = new Html5Qrcode('qr-reader');
html5QrCode.start(
  { facingMode: 'environment' },
  { fps: 10, qrbox: { width: 250, height: 250 } },
  onScanSuccess
);

// Validate
const qrData = JSON.parse(decodedText);
await ticketService.validateTicket(qrData.ticket_id);
```

## Security

- JWT token disimpan di **cookies** (js-cookie)
- Auto-attach JWT di Axios interceptors
- Protected routes cek `authService.isAuthenticated()`
- Admin routes cek `authService.isAdmin()`

## Pages Summary

| Route | Access | Deskripsi |
|-------|--------|-----------|
| `/` | Public | Landing page |
| `/login` | Public | Login form |
| `/register` | Public | Register form |
| `/events` | User | Event list |
| `/events/[id]` | User | Event detail + checkout |
| `/my-tickets` | User | User tickets dengan QR |
| `/admin/dashboard` | Admin | Admin dashboard |
| `/admin/events` | Admin | CRUD events |
| `/admin/orders` | Admin | View all orders |
| `/admin/scan` | Admin | Scan QR validation |
