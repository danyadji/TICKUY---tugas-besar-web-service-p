# Atomic Design Implementation - TICKUY

## 📚 Struktur Atomic Design

Proyek TICKUY sekarang menggunakan **Atomic Design** untuk arsitektur komponen yang lebih terstruktur dan maintainable.

```
components/
├── elements/        # Komponen paling dasar (atoms)
│   ├── Button.tsx   # Komponen button dengan berbagai varian
│   ├── Input.tsx    # Komponen input field
│   ├── Logo.tsx     # Logo TICKUY
│   ├── Avatar.tsx   # Avatar user
│   └── index.ts     # Export barrel file
├── components/      # Kombinasi dari elements (molecules)
│   ├── SearchBar.tsx        # Search bar dengan input dan icon
│   ├── NavLink.tsx          # Link navigasi dengan icon dan label
│   ├── LanguageSelector.tsx # Dropdown pemilih bahasa
│   ├── UserMenu.tsx         # Menu dropdown user/profil
│   └── index.ts             # Export barrel file
├── sections/        # Kombinasi dari components dan elements (organisms)
│   ├── Navbar.tsx   # Navigation bar lengkap
│   └── index.ts     # Export barrel file
├── layouts/         # Layout halaman (templates)
│   └── (coming soon)
└── index.ts         # Main export file
```

## 🧱 Level Atomic Design

### 1. **Elements (Atoms)** - Komponen Dasar

Komponen paling kecil yang tidak bisa dipecah lagi:

#### `Button.tsx`
Props:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `href`: untuk Link atau URL
- `onClick`: handler function
- `disabled`: boolean

```tsx
import { Button } from '@/components/elements';

<Button variant="primary" size="md" href="/register">
  Daftar
</Button>
```

#### `Input.tsx`
Props:
- `type`: jenis input
- `placeholder`: teks placeholder
- `value`: nilai input
- `onChange`: handler perubahan
- `icon`: ReactNode untuk icon

```tsx
import { Input } from '@/components/elements';

<Input 
  type="text"
  placeholder="Cari event..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  icon={<SearchIcon />}
/>
```

#### `Logo.tsx`
Komponen logo TICKUY yang sudah jadi, tinggal import dan pakai.

```tsx
import { Logo } from '@/components/elements';

<Logo />
```

#### `Avatar.tsx`
Props:
- `name`: nama user (untuk initial)
- `size`: 'sm' | 'md' | 'lg'

```tsx
import { Avatar } from '@/components/elements';

<Avatar name={userName} size="md" />
```

---

### 2. **Components (Molecules)** - Kombinasi Elements

Gabungan dari beberapa elements yang membentuk komponen fungsional:

#### `SearchBar.tsx`
Kombinasi Input + Icon untuk search functionality.

Props:
- `value`: string
- `onChange`: (value: string) => void
- `onSubmit`: (e: FormEvent) => void
- `placeholder`: string (optional)

```tsx
import { SearchBar } from '@/components/components';

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSubmit={handleSearch}
/>
```

#### `NavLink.tsx`
Kombinasi Link + Icon + Text untuk navigasi.

Props:
- `href`: URL tujuan
- `icon`: ReactNode (SVG icon)
- `label`: teks label
- `variant`: 'default' | 'primary'

```tsx
import { NavLink } from '@/components/components';

<NavLink
  href="/my-tickets"
  icon={<TicketIcon />}
  label="Tiket"
/>
```

#### `UserMenu.tsx`
Dropdown menu user dengan avatar, info, dan logout.

Props:
- `userName`: string
- `onLogout`: () => void

```tsx
import { UserMenu } from '@/components/components';

<UserMenu
  userName={userName}
  onLogout={handleLogout}
/>
```

#### `LanguageSelector.tsx`
Dropdown selector bahasa (saat ini hanya ID).

```tsx
import { LanguageSelector } from '@/components/components';

<LanguageSelector />
```

---

### 3. **Sections (Organisms)** - Kombinasi Components

Kombinasi components dan elements yang membentuk section kompleks:

#### `Navbar.tsx`
Navigation bar lengkap dengan logo, search, dan menu.

Props:
- `isAuthenticated`: boolean
- `userName`: string
- `searchQuery`: string
- `onSearchChange`: (value: string) => void
- `onSearchSubmit`: (e: FormEvent) => void
- `onLogout`: () => void

```tsx
import { Navbar } from '@/components/sections';

<Navbar
  isAuthenticated={isAuthenticated}
  userName={userName}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onSearchSubmit={handleSearch}
  onLogout={handleLogout}
/>
```

---

## 📝 Cara Penggunaan

### Import dari Root

Semua komponen bisa diimport dari folder components:

```tsx
import { Button, Input, Logo, Avatar } from '@/components/elements';
import { SearchBar, NavLink, UserMenu } from '@/components/components';
import { Navbar } from '@/components/sections';
```

### Atau Import Langsung

```tsx
import { Navbar } from '@/components';
```

---

## ✅ Keuntungan Atomic Design

1. **Reusability** - Komponen bisa dipakai ulang di berbagai halaman
2. **Consistency** - UI konsisten karena pakai komponen yang sama
3. **Maintainability** - Mudah update, cukup ubah di satu tempat
4. **Scalability** - Mudah menambah komponen baru
5. **Testing** - Lebih mudah di-test karena komponen kecil
6. **Collaboration** - Tim bisa kerja parallel pada level berbeda
7. **Documentation** - Struktur jelas, mudah dipahami

---

## 🎯 Best Practices

1. **Elements harus stateless** - Tidak punya state internal
2. **Props yang jelas** - Gunakan TypeScript interface
3. **Single Responsibility** - Satu komponen, satu tujuan
4. **Naming Convention** - Nama yang deskriptif (Button, not Btn)
5. **Composable** - Bisa dikombinasikan dengan mudah
6. **Documented** - Setiap komponen ada komentar/docs

---

## 🚀 Next Steps

- [ ] Buat komponen EventCard sebagai section
- [ ] Buat komponen Hero untuk landing page
- [ ] Buat layouts untuk layout halaman
- [ ] Implementasi di halaman lain (login, register, events, dll)
- [ ] Setup Storybook untuk component documentation
- [ ] Tambah unit tests untuk setiap komponen

---

## 📖 Referensi

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Pattern Lab](https://patternlab.io/)
