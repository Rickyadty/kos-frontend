# Design System Specification — Aurex Kos Living

Dokumen ini merupakan panduan resmi desain (Design System) untuk aplikasi **Sistem Manajemen Kos (Aurex Kos Living)**. Seluruh komponen, halaman, dan elemen antarmuka (UI) wajib mengacu pada panduan ini agar tampilan tetap konsisten, elegan, minimalis, dan berkelas tinggi (luxury architectural aesthetic).

---

## 1. Filosofi Desain

- **Gaya Desain**: *Modern Luxury Architectural Minimalism & Soft Neumorphism*.
- **Kesan Utama**: Bersih, luas, terorganisir, mewah, dan menenangkan (clean off-white backdrop dengan kontras hitam pekat dan aksen warm sand/terracotta).
- **Karakteristik Visual**:
  - Sudut sangat membulat (*generous rounded corners*: `rounded-2xl`, `rounded-3xl` / `28px`, hingga `rounded-full` untuk pills).
  - Kontras tinggi antara elemen kartu putih bersih (*pure white*) di atas kanvas abu-abu lembut (*soft warm canvas*).
  - *Pill-based UI*: Tab navigasi, filter, dan status badge menggunakan bentuk pil lonjong penuh (*pill capsule*).
  - Aksen visual arsitektur properti: Penggunaan fotografi fasad/interior modern beresolusi tinggi, ikon minimalis, dan barcode/sparkline dekoratif.

---

## 2. Palet Warna (Color Palette)

### A. Background & Surface
| Token | Nilai Hex | Penggunaan |
|---|---|---|
| **Canvas Background** | `#ececee` / `#f0f1f4` | Background utama seluruh halaman / aplikasi |
| **Surface White** | `#ffffff` | Background kartu (*card*), modal, dropdown, dan elemen elevated |
| **Surface Muted** | `#f5f6f8` | Background input, elemen sekunder, dan pill tidak aktif |
| **Border Subtle** | `rgba(0, 0, 0, 0.05)` / `#e5e7eb` | Garis pembatas tipis dan elegan (*hairline border*) |

### B. Brand & Primary Contrast
| Token | Nilai Hex | Penggunaan |
|---|---|---|
| **Jet Black** | `#0f0f11` / `#000000` | Navigasi aktif, teks judul utama, tombol primer, chart bars |
| **Deep Slate** | `#1e293b` | Teks subjudul dan ikon gelap |
| **Muted Slate** | `#64748b` | Teks pendukung, label keterangan, dan teks sekunder |
| **Light Slate** | `#94a3b8` | Placeholder, divider, dan ikon non-aktif |

### C. Aksen & Status Warna
| Token | Nilai Hex | Penggunaan |
|---|---|---|
| **Warm Sand / Terracotta** | `#e2b488` / `#d49b6a` | Bar progres kamar, highlight aksen, badge perhatian |
| **Mint Emerald (Aktif/Lunas)** | `#d1fae5` (Bg), `#065f46` (Text) | Status "Kosong", "Lunas", "Aktif", persentase positif |
| **Soft Peach (Pending/Terisi)** | `#fed7aa` (Bg), `#9a3412` (Text) | Status "Terisi", "Pending", "Perlu Tindakan" |
| **Soft Crimson (Penuh/Terlambat)**| `#fee2e2` (Bg), `#991b1b` (Text) | Status "Penuh", "Belum Bayar", "Jatuh Tempo" |

---

## 3. Tipografi (Typography)

- **Font Utama**: `'Inter', system-ui, -apple-system, sans-serif`
- **Hirarki Ukuran**:
  - **Display Metric**: `text-2xl` sampai `text-3xl` (`font-bold`, tracking `-0.02em`) untuk angka nominal / metrik statistik.
  - **Section Title**: `text-lg` sampai `text-xl` (`font-bold`, text `#0f0f11`).
  - **Card Title**: `text-base` (`font-semibold`).
  - **Body / Content**: `text-sm` (`font-medium` atau `font-normal`, text `#334155`).
  - **Caption / Meta**: `text-xs` (`font-medium`, text `#64748b` atau `#94a3b8`).

---

## 4. Bentuk & Sudut Lengkung (Border Radius)

| Elemen | Radius Class | Ukuran Piksel |
|---|---|---|
| **Main Card & Section** | `rounded-3xl` / `rounded-[28px]` | `28px` |
| **Showcase Media / Photo** | `rounded-2xl` / `rounded-[20px]` | `20px` |
| **Pill Buttons & Tabs** | `rounded-full` | `9999px` (Full Pill) |
| **Circular Action Icons** | `rounded-full` (`w-9 h-9` / `w-10 h-10`) | Lingkaran Penuh |
| **Input Fields & Dropdowns** | `rounded-full` | `9999px` |

---

## 5. Shadow & Elevasi

- **Card Shadow**: `shadow-[0_4px_24px_rgba(0,0,0,0.03)]`
- **Circular Button Shadow**: `shadow-sm hover:shadow transition-all`
- **Floating Bar Shadow**: `shadow-[0_8px_30px_rgba(0,0,0,0.04)]`

---

## 6. Komponen Utama

### A. Top Navigation Bar (Floating Pill Layout)
- **Kiri**: Logo ikon modern geometris + Teks brand (`Aurex Kos Living`).
- **Tengah**: Pill Container (`bg-white/80 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-black/5`):
  - **Tab Aktif**: `bg-black text-white px-5 py-2 rounded-full text-sm font-semibold shadow-sm`.
  - **Tab Non-Aktif**: `text-slate-600 hover:text-black hover:bg-slate-100/70 px-4 py-2 rounded-full text-sm font-medium transition-all`.
- **Kanan**:
  - Tombol aksi sirkular (`w-10 h-10 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50`).
  - Ikon: Pencarian (`Search`), Notifikasi (`Bell`), Pengaturan / Keluar (`Settings/Logout`).
  - Foto Profil / Avatar berbentuk lingkaran dengan ring tipis.

### B. Metric & Stat Cards
- Berlatar belakang putih bersih (`bg-white rounded-3xl p-6`).
- Terdapat tombol sirkular kecil di sudut kanan atas dengan ikon panah diagonal (`↗`).
- Menampilkan judul metrik kecil di atas, nilai angka besar tebal di tengah, dan keterangan periode di bawah.
- Terdapat ilustrasi dekoratif garis *barcode / equalizer* vertikal minimalis di sudut kanan bawah.

### C. Properti & Kamar Showcase Cards
- Foto arsitektur ruangan / fasad dengan rasio proporsional dan sudut membulat (`rounded-2xl`).
- Floating badge sirkular pada gambar:
  - Tombol Love / Wishlist (`♡`).
  - Tombol Detail (`↗`).
- Tag rating & kategori: `Apartment ★ 4.8` atau `Lantai 1 ★ 4.9`.
- Spesifikasi fasilitas dengan teks ringkas: `1 Bed · 1 Bath · AC · WiFi`.
- Harga bulanan dengan aksen tebal: `Rp1.200.000 / bln`.

### D. Filter Bar
- Menggunakan tombol-tombol pil *dropdown*:
  - `[ 🏢 Lantai ⌄ ]`
  - `[ 🏷️ Status ⌄ ]`
  - `[ 💰 Harga ⌄ ]`
- Input pencarian berbentuk pil dengan ikon kaca pembesar: `[ 🔍 Cari kamar atau penghuni... ]`.
- Tombol filter sirkular dan tombol expand (`↗`).

### E. Tabel Data Minimalis
- Header tabel tanpa border mencolok, menggunakan font kecil abu-abu bersahabat.
- Baris tabel memiliki *hover effect* lembut (`hover:bg-slate-50/80 transition-colors`).
- Kolom properti menampilkan thumbnail bundar/persegi tumpul + nama kamar + deskripsi singkat.
- Status badge berbentuk kapsul pastel lembut:
  - `Terisi` / `Aktif` : `bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold`
  - `Kosong` / `Pending`: `bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold`
  - `Penuh` / `Belum Bayar`: `bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold`

### F. Widget Denah / Peta Visual (Map Node Widget)
- Kartu visual yang merepresentasikan tata letak kamar atau zona (Lantai 1, Lantai 2, Sayap Utama).
- Menggunakan lingkaran gradien lembut dengan radar ring untuk menampilkan kepadatan okupansi secara futuristik dan intuitif.

---

## 7. Checklist Implementasi Halaman Baru

Bila membuat atau memperbarui halaman lain di masa mendatang, pastikan:
1. [ ] Background halaman menggunakan kanvas `#ececee` / `#f0f1f4`.
2. [ ] Card utama dibungkus dengan `bg-white rounded-3xl p-6 border border-black/[0.04] shadow-sm`.
3. [ ] Tombol utama menggunakan gaya pil hitam (`bg-black text-white hover:bg-neutral-800 rounded-full px-5 py-2.5`).
4. [ ] Tombol sekunder menggunakan pil putih bergaris (`bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-full px-5 py-2.5`).
5. [ ] Input formulir memiliki sudut membulat penuh (`rounded-full`) atau `rounded-2xl` untuk textarea.
6. [ ] Navigasi atas tetap menggunakan bar pil (*floating pill navigation*) yang konsisten.
7. [ ] Badge status menggunakan `rounded-full` dengan warna pastel lembut.
