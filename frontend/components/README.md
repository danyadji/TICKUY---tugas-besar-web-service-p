# Atomic Design - Quick Start Guide

## 🎯 Struktur Komponen

```
components/
├── elements/       # Komponen dasar (atoms)
├── components/     # Kombinasi elements (molecules)  
├── sections/       # Kombinasi components (organisms)
└── layouts/        # Layout halaman (templates)
```

## 📦 Komponen yang Tersedia

### Elements (Atoms)
- `Button` - Tombol dengan berbagai varian
- `Input` - Input field dengan icon
- `Logo` - Logo TICKUY
- `Avatar` - Avatar user dengan initial

### Components (Molecules)
- `SearchBar` - Search bar dengan input
- `NavLink` - Link navigasi
- `UserMenu` - Dropdown menu user
- `LanguageSelector` - Selector bahasa

### Sections (Organisms)
- `Navbar` - Navigation bar lengkap

## 💻 Contoh Penggunaan

```tsx
import { Navbar } from '@/components/sections';

<Navbar
  isAuthenticated={isAuth}
  userName="John Doe"
  searchQuery={search}
  onSearchChange={setSearch}
  onSearchSubmit={handleSearch}
  onLogout={handleLogout}
/>
```

## 📖 Dokumentasi Lengkap

Lihat `ATOMIC_DESIGN.md` untuk dokumentasi lengkap.
