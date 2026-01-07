# ✅ CHECKLIST TESTING MANUAL - AUTH SERVICE TICKUY

**Tester:** _____________  
**Tanggal:** _____________  
**Environment:** Development / Production  
**Base URL:** http://localhost:3001

---

## 🔧 PRE-TESTING CHECKLIST

- [ ] Server auth-service sudah running di port 3001
- [ ] Database `tickuy_db` sudah dibuat
- [ ] Table `users` sudah dibuat
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Testing tool siap (Postman / Thunder Client / curl)

---

## 1️⃣ TESTING REGISTER USER

### ✅ Test Case 1.1: Register User Valid (Happy Path)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Expected Result:**
- [ ] HTTP Status: `201 Created`
- [ ] Response berisi `success: true`
- [ ] Response berisi `message: "Registrasi berhasil"`
- [ ] Response berisi data user (id, nama, email, role)
- [ ] Password TIDAK muncul di response
- [ ] Data tersimpan di database
- [ ] Password ter-hash di database (bukan plain text)

**Actual Result:** ________________

---

### ❌ Test Case 1.2: Register dengan Email Kosong

**Request Body:**
```
{
  "nama": "John Doe",
  "email": "",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi `success: false`
- [ ] Response berisi error validation "Email tidak valid"
- [ ] Data TIDAK tersimpan di database

**Actual Result:** ________________

---

### ❌ Test Case 1.3: Register dengan Email Tidak Valid

**Request Body:**
```
{
  "nama": "John Doe",
  "email": "emailtidakvalid",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi error validation email format
- [ ] Data TIDAK tersimpan di database

**Actual Result:** ________________

---

### ❌ Test Case 1.4: Register dengan Password Kurang dari 6 Karakter

**Request Body:**
```
{
  "nama": "John Doe",
  "email": "john2@example.com",
  "password": "12345"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi error "Password minimal 6 karakter"
- [ ] Data TIDAK tersimpan di database

**Actual Result:** ________________

---

### ❌ Test Case 1.5: Register dengan Nama Kosong

**Request Body:**
```
{
  "nama": "",
  "email": "john3@example.com",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi error "Nama harus diisi"
- [ ] Data TIDAK tersimpan di database

**Actual Result:** ________________

---

### ❌ Test Case 1.6: Register dengan Email Duplikat

**Precondition:** Email `john@example.com` sudah terdaftar (dari Test 1.1)

**Request Body:**
```
{
  "nama": "Jane Doe",
  "email": "john@example.com",
  "password": "password456"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi `success: false`
- [ ] Response berisi message "Email sudah terdaftar"
- [ ] Data TIDAK tersimpan di database

**Actual Result:** ________________

---

### ✅ Test Case 1.7: Register Admin Valid

**Request Body:**
```
{
  "nama": "Admin TICKUY",
  "email": "admin@tickuy.com",
  "password": "admin123456",
  "role": "admin"
}
```

**Expected Result:**
- [ ] HTTP Status: `201 Created`
- [ ] Response berisi `success: true`
- [ ] Response berisi role: "admin"
- [ ] Data tersimpan dengan role admin di database

**Actual Result:** ________________

---

### ❌ Test Case 1.8: Register dengan Role Invalid

**Request Body:**
```
{
  "nama": "Hacker",
  "email": "hacker@example.com",
  "password": "password123",
  "role": "superadmin"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi error validation role
- [ ] Data TIDAK tersimpan di database

**Actual Result:** ________________

---

### ✅ Test Case 1.9: Register Tanpa Field Role (Default User)

**Request Body:**
```
{
  "nama": "Default User",
  "email": "default@example.com",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `201 Created`
- [ ] Response berisi role: "user" (default)
- [ ] Data tersimpan dengan role user di database

**Actual Result:** ________________

---

## 2️⃣ TESTING LOGIN USER

### ✅ Test Case 2.1: Login User Valid (Happy Path)

**Precondition:** User `john@example.com` sudah terdaftar

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi `success: true`
- [ ] Response berisi `message: "Login berhasil"`
- [ ] Response berisi data user (id, nama, email, role)
- [ ] Response berisi `token` (JWT string panjang)
- [ ] Token NOT null dan NOT empty
- [ ] Password TIDAK muncul di response

**Actual Result:** ________________

**JWT Token (simpan untuk test selanjutnya):**
```
eyJhbGc...
```

---

### ❌ Test Case 2.2: Login dengan Email Tidak Terdaftar

**Request Body:**
```
{
  "email": "tidakada@example.com",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `401 Unauthorized`
- [ ] Response berisi `success: false`
- [ ] Response berisi message "Email atau password salah"
- [ ] Token TIDAK dikembalikan

**Actual Result:** ________________

---

### ❌ Test Case 2.3: Login dengan Password Salah

**Request Body:**
```
{
  "email": "john@example.com",
  "password": "passwordsalah"
}
```

**Expected Result:**
- [ ] HTTP Status: `401 Unauthorized`
- [ ] Response berisi message "Email atau password salah"
- [ ] Token TIDAK dikembalikan

**Actual Result:** ________________

---

### ❌ Test Case 2.4: Login dengan Email Kosong

**Request Body:**
```
{
  "email": "",
  "password": "password123"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi error validation email
- [ ] Token TIDAK dikembalikan

**Actual Result:** ________________

---

### ❌ Test Case 2.5: Login dengan Password Kosong

**Request Body:**
```
{
  "email": "john@example.com",
  "password": ""
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi error "Password harus diisi"
- [ ] Token TIDAK dikembalikan

**Actual Result:** ________________

---

### ✅ Test Case 2.6: Login Admin Valid

**Precondition:** Admin `admin@tickuy.com` sudah terdaftar

**Request Body:**
```
{
  "email": "admin@tickuy.com",
  "password": "admin123456"
}
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi `success: true`
- [ ] Response berisi role: "admin"
- [ ] Response berisi token JWT
- [ ] Token valid

**Actual Result:** ________________

**Admin JWT Token (simpan untuk test selanjutnya):**
```
eyJhbGc...
```

---

## 3️⃣ TESTING JWT TOKEN

### ✅ Test Case 3.1: Akses Protected Route dengan Token Valid

**Precondition:** Sudah punya token dari login (Test 2.1)

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi data profil user
- [ ] Response berisi id, nama, email, role
- [ ] Password TIDAK muncul di response

**Actual Result:** ________________

---

### ❌ Test Case 3.2: Akses Protected Route Tanpa Token

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
(Tidak ada Authorization header)
```

**Expected Result:**
- [ ] HTTP Status: `401 Unauthorized`
- [ ] Response berisi `success: false`
- [ ] Response berisi message "Token tidak ditemukan"
- [ ] Data profil TIDAK dikembalikan

**Actual Result:** ________________

---

### ❌ Test Case 3.3: Akses Protected Route dengan Token Invalid

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer tokenpalsuinivalid123456
```

**Expected Result:**
- [ ] HTTP Status: `403 Forbidden`
- [ ] Response berisi message "Token tidak valid atau sudah kadaluarsa"
- [ ] Data profil TIDAK dikembalikan

**Actual Result:** ________________

---

### ❌ Test Case 3.4: Token Tanpa Prefix "Bearer"

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: <user-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `401 Unauthorized`
- [ ] Response berisi error token
- [ ] Data profil TIDAK dikembalikan

**Actual Result:** ________________

---

### ✅ Test Case 3.5: Decode JWT Token dan Verifikasi Payload

**Tool:** jwt.io atau jwt decoder

**Action:**
- [ ] Copy JWT token dari login
- [ ] Paste ke jwt.io
- [ ] Decode token

**Expected Result:**
- [ ] Payload berisi `id` (user ID)
- [ ] Payload berisi `email`
- [ ] Payload berisi `role` (user/admin)
- [ ] Payload berisi `iat` (issued at timestamp)
- [ ] Payload berisi `exp` (expiration timestamp)
- [ ] Expiration = 7 hari dari iat
- [ ] Password TIDAK ada di payload

**Actual Result:** ________________

---

## 4️⃣ TESTING ROLE USER

### ✅ Test Case 4.1: User Role - Get Profile (Allowed)

**Precondition:** Login sebagai user role

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi data profil user
- [ ] Response menampilkan role: "user"

**Actual Result:** ________________

---

### ✅ Test Case 4.2: User Role - Update Profile (Allowed)

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Request Body:**
```
{
  "nama": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi `success: true`
- [ ] Response berisi message "Profil berhasil diupdate"
- [ ] Data terupdate di database

**Actual Result:** ________________

---

### ❌ Test Case 4.3: User Role - Get All Users (Denied)

**Endpoint:** `GET /api/auth/users`

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `403 Forbidden`
- [ ] Response berisi `success: false`
- [ ] Response berisi message "Akses ditolak. Hanya admin yang dapat mengakses"
- [ ] Data users TIDAK dikembalikan

**Actual Result:** ________________

---

### ❌ Test Case 4.4: User Role - Delete User (Denied)

**Endpoint:** `DELETE /api/auth/users/1`

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `403 Forbidden`
- [ ] Response berisi message akses ditolak
- [ ] User TIDAK terhapus dari database

**Actual Result:** ________________

---

## 5️⃣ TESTING ROLE ADMIN

### ✅ Test Case 5.1: Admin Role - Get Profile (Allowed)

**Precondition:** Login sebagai admin role

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi data profil admin
- [ ] Response menampilkan role: "admin"

**Actual Result:** ________________

---

### ✅ Test Case 5.2: Admin Role - Get All Users (Allowed)

**Endpoint:** `GET /api/auth/users`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi `success: true`
- [ ] Response berisi array data users
- [ ] Semua users ditampilkan (user + admin)
- [ ] Password TIDAK muncul di response

**Actual Result:** ________________

**Jumlah users yang dikembalikan:** ______

---

### ✅ Test Case 5.3: Admin Role - Delete User (Allowed)

**Precondition:** Ada user dengan ID tertentu yang bisa dihapus

**Endpoint:** `DELETE /api/auth/users/<user-id>`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi `success: true`
- [ ] Response berisi message "User berhasil dihapus"
- [ ] User terhapus dari database
- [ ] Verifikasi dengan GET /api/auth/users (user tidak ada)

**Actual Result:** ________________

---

### ❌ Test Case 5.4: Admin Role - Delete User yang Tidak Ada

**Endpoint:** `DELETE /api/auth/users/99999`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `404 Not Found`
- [ ] Response berisi message "User tidak ditemukan"

**Actual Result:** ________________

---

### ❌ Test Case 5.5: Admin Role - Delete Diri Sendiri (Prevented)

**Precondition:** Login sebagai admin, cari ID admin dari profil

**Endpoint:** `DELETE /api/auth/users/<admin-id-sendiri>`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi message "Tidak dapat menghapus akun sendiri"
- [ ] Admin TIDAK terhapus dari database

**Actual Result:** ________________

---

### ✅ Test Case 5.6: Admin Role - Update Profile (Allowed)

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```
{
  "nama": "Admin Updated",
  "email": "admin.updated@tickuy.com"
}
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi success
- [ ] Data terupdate di database
- [ ] Role tetap "admin" (tidak berubah)

**Actual Result:** ________________

---

## 6️⃣ TESTING UPDATE PROFILE

### ❌ Test Case 6.1: Update Profile dengan Email Duplikat

**Precondition:** 
- User A: john@example.com
- User B: jane@example.com (sudah terdaftar)
- Login sebagai User A

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <user-A-jwt-token>
```

**Request Body:**
```
{
  "nama": "John Doe",
  "email": "jane@example.com"
}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi message "Email sudah digunakan"
- [ ] Email User A TIDAK berubah di database

**Actual Result:** ________________

---

### ✅ Test Case 6.2: Update Profile dengan Email Sama (Allowed)

**Precondition:** Login sebagai user dengan email john@example.com

**Endpoint:** `PUT /api/auth/profile`

**Request Body:**
```
{
  "nama": "John Doe Changed Name Only",
  "email": "john@example.com"
}
```

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Nama berhasil diupdate
- [ ] Email tetap sama (tidak ada error duplikat)

**Actual Result:** ________________

---

## 7️⃣ TESTING EDGE CASES

### ❌ Test Case 7.1: Request dengan Body Kosong (Register)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```
{}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi multiple validation errors

**Actual Result:** ________________

---

### ❌ Test Case 7.2: Request dengan Body Kosong (Login)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```
{}
```

**Expected Result:**
- [ ] HTTP Status: `400 Bad Request`
- [ ] Response berisi validation errors

**Actual Result:** ________________

---

### ❌ Test Case 7.3: Request dengan Field Tambahan (Ignored)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```
{
  "nama": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "user",
  "hacker_field": "malicious_data",
  "is_verified": true
}
```

**Expected Result:**
- [ ] HTTP Status: `201 Created`
- [ ] Field tambahan diabaikan
- [ ] Hanya field valid yang tersimpan di database

**Actual Result:** ________________

---

### ❌ Test Case 7.4: Akses Endpoint Tidak Ada

**Endpoint:** `GET /api/auth/notfound`

**Expected Result:**
- [ ] HTTP Status: `404 Not Found`
- [ ] Response berisi message "Endpoint tidak ditemukan"

**Actual Result:** ________________

---

### ✅ Test Case 7.5: Akses Root Endpoint

**Endpoint:** `GET /`

**Expected Result:**
- [ ] HTTP Status: `200 OK`
- [ ] Response berisi info service
- [ ] Response berisi message "TICKUY Auth Service API"
- [ ] Response berisi version

**Actual Result:** ________________

---

## 8️⃣ TESTING DATABASE INTEGRITY

### ✅ Test Case 8.1: Verifikasi Password Hashing

**Action:**
- [ ] Buat user baru dengan password "testpassword123"
- [ ] Cek database langsung di table users

**Expected Result:**
- [ ] Password di database BUKAN "testpassword123"
- [ ] Password berupa hash bcrypt (dimulai dengan $2a$ atau $2b$)
- [ ] Panjang hash password sekitar 60 karakter

**Actual Result:** ________________

**Password hash di DB:**
```
$2b$10$...
```

---

### ✅ Test Case 8.2: Verifikasi Email Unique Constraint

**Action:**
- [ ] Coba insert manual di database dengan email duplikat

**Expected Result:**
- [ ] Database menolak insert (Duplicate entry error)
- [ ] Unique constraint bekerja

**Actual Result:** ________________

---

### ✅ Test Case 8.3: Verifikasi Default Role

**Action:**
- [ ] Register user tanpa field role
- [ ] Cek database

**Expected Result:**
- [ ] Role di database = "user" (default)

**Actual Result:** ________________

---

### ✅ Test Case 8.4: Verifikasi Timestamp Created_at & Updated_at

**Action:**
- [ ] Buat user baru
- [ ] Cek database untuk created_at
- [ ] Update profil user
- [ ] Cek database untuk updated_at

**Expected Result:**
- [ ] created_at terisi otomatis saat insert
- [ ] updated_at terisi otomatis saat insert
- [ ] updated_at berubah saat update

**Actual Result:** ________________

---

## 📊 TESTING SUMMARY

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Register | 9 | ___ | ___ | |
| Login | 6 | ___ | ___ | |
| JWT Token | 5 | ___ | ___ | |
| Role User | 4 | ___ | ___ | |
| Role Admin | 6 | ___ | ___ | |
| Update Profile | 2 | ___ | ___ | |
| Edge Cases | 5 | ___ | ___ | |
| Database | 4 | ___ | ___ | |
| **TOTAL** | **41** | ___ | ___ | |

---

## 🐛 BUGS FOUND

| No | Test Case | Severity | Description | Status |
|----|-----------|----------|-------------|--------|
| 1  |           |          |             |        |
| 2  |           |          |             |        |
| 3  |           |          |             |        |

**Severity Levels:**
- Critical: Service tidak bisa digunakan
- High: Fitur utama tidak bekerja
- Medium: Fitur bekerja tapi ada masalah
- Low: Masalah kecil atau UI/UX

---

## ✅ TESTING CONCLUSION

**Overall Status:** PASS / FAIL / PARTIAL

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Tested by:** _________________  
**Date Completed:** _________________  
**Signature:** _________________

---

## 📝 REKOMENDASI

- [ ] Semua test case passed → Auth Service READY untuk production
- [ ] Ada bugs critical → FIX segera sebelum deploy
- [ ] Ada bugs high → FIX sebelum integrasi dengan service lain
- [ ] Performance test diperlukan untuk load testing
- [ ] Security audit diperlukan sebelum production

---

**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Document Owner:** QA Team TICKUY
