# Blueprint Aplikasi Web YatimCare

## Versi Arsitektur

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express.js + TypeScript
- ORM: MySQL native adapter
- Database: MySQL 8+
- Cache: Redis
- Storage: MinIO atau local storage

## Visi

Membangun sistem informasi yayasan yang transparan, modern, aman, dan mudah digunakan untuk pengelolaan data anak yatim, donatur, donasi, pengeluaran, dan penyaluran bantuan.

## Modul Utama

- Landing page transparansi
- Dashboard admin
- Manajemen data anak
- Peta lokasi berbasis Leaflet/OpenStreetMap
- Registrasi dan login donatur
- Registrasi anak atau wali
- Donasi masuk
- Pengeluaran dana
- Penyaluran bantuan
- Program donasi
- Laporan
- Notifikasi
- Audit log
- Pengaturan sistem

## Dashboard Admin

- Total anak
- Jumlah anak yatim
- Jumlah anak piatu
- Jumlah anak yatim piatu
- Total donatur
- Donasi masuk
- Pengeluaran
- Saldo yayasan
- Grafik donasi
- Grafik pengeluaran
- Grafik sebaran anak
- Aktivitas terbaru

## Data Anak

- No registrasi
- Nama
- NIK
- No KK
- Alamat
- Koordinat GPS
- Lokasi map
- Sekolah
- Nama wali
- No HP wali
- Dokumen
- Status verifikasi
- Riwayat bantuan

## Hak Akses

- Super Admin
- Admin
- Bendahara
- Petugas
- Donatur
- Wali atau pendaftar

## Backend Node.js

### Stack yang direkomendasikan

- Node.js 22 LTS
- Express.js
- TypeScript
- MySQL native adapter
- MySQL
- JWT Authentication
- Redis
- Multer
- Sharp
- Nodemailer
- Swagger/OpenAPI
- Winston Logger
- Docker

### Struktur Backend

```text
backend/
  src/
    modules/
      auth/
      children/
      donors/
      donations/
      dashboard/
      reports/
    middleware/
    routes/
    lib/
    config/
    app.ts
    server.ts
  prisma/
    schema.prisma
  package.json
  tsconfig.json
```

## REST API Awal

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/dashboard`
- `GET /api/children`
- `POST /api/children`
- `PUT /api/children/:id`
- `GET /api/donors`
- `POST /api/donations`
- `GET /api/reports/finance`

## Database Direction

- Gunakan charset `utf8mb4`
- Gunakan collation `utf8mb4_unicode_ci`
- Simpan relasi utama untuk users, guardians, children, donors, programs, donations, expenses, aid distributions, surveys, audit logs, dan notifications
- Gunakan skema database MySQL native sebagai source of truth

## Roadmap

1. MVP
2. Laporan dan transparansi
3. Payment gateway
4. WhatsApp notification
5. Mobile app

## Catatan Pengembangan

Blueprint ini sudah diselaraskan ke MySQL dan siap dijadikan dasar implementasi backend. Langkah berikutnya adalah melengkapi validation rules, auth flow, seed data, migration, dan OpenAPI specification.
