Version"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</p>

<p align="center">
  Aplikasi web speed test real-time yang modern dan elegan dengan desain glassmorphism, animasi partikel, dan multi-theme support. Dibangun menggunakan <strong>pure HTML, CSS, dan JavaScript</strong> tanpa framework tambahan.
</p>

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [API yang Digunakan](#-api-yang-digunakan)
- [Struktur Project](#-struktur-project)
- [Cara Menjalankan](#-cara-menjalankan)
- [Detail Fitur](#-detail-fitur)
- [Arsitektur Kode](#-arsitektur-kode)
- [Kustomisasi](#-kustomisasi)
- [Browser Support](#-browser-support)
- [Lisensi](#-lisensi)

---

## 🚀 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🏎️ **Real Speed Test** | Tes kecepatan internet nyata (download, upload, ping, jitter) menggunakan server Cloudflare |
| 🕐 **Live Clock** | Jam digital real-time dengan tanggal dan deteksi timezone otomatis |
| 🌤️ **Weather Widget** | Informasi cuaca real-time berdasarkan lokasi (suhu, kelembaban, angin) |
| 🌐 **IP Detection** | Deteksi IP address, ISP, dan lokasi dengan 6 strategi fallback |
| 🎨 **Multi-Theme** | 4 tema warna (Cyber Blue, Neon Green, Purple Haze, Sunset Orange) |
| 📊 **Test History** | Riwayat hasil tes tersimpan di localStorage (hingga 20 entri) |
| ✨ **Particle Animation** | Animasi partikel interaktif di background (desktop) |
| 📱 **Responsive Design** | Tampilan optimal di desktop, tablet, dan mobile |

---

## 🛠️ Tech Stack

### Framework & Library

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **HTML5** | - | Struktur halaman dan semantic markup |
| **CSS3** | - | Styling, animasi, glassmorphism, responsive design |
| **Vanilla JavaScript** | ES2017+ | Logika aplikasi, async/await, Fetch API |
| **Google Fonts** | - | Font Orbitron (display) & Inter (body text) |

> ⚠️ **Tidak menggunakan framework apapun** — Murni HTML, CSS, dan JavaScript vanilla untuk performa maksimal dan zero dependency.

### Teknologi CSS yang Digunakan

- **CSS Custom Properties (Variables)** — Sistem tema dinamis
- **Glassmorphism** — `backdrop-filter: blur()` untuk efek kaca
- **CSS Grid & Flexbox** — Layout responsive
- **CSS Animations & Keyframes** — Animasi pulse, glow, slide
- **SVG Inline** — Ikon dan gauge meter
- **Media Queries** — Responsive breakpoints (768px, 380px)

### Teknologi JavaScript yang Digunakan

- **Fetch API** — HTTP requests ke semua API
- **AbortController** — Timeout handling untuk fetch requests
- **Performance API** — `performance.now()` untuk pengukuran presisi tinggi
- **ReadableStream API** — Streaming download untuk real-time speed measurement
- **Canvas API** — Animasi partikel di background
- **Geolocation API** — Fallback lokasi via browser
- **localStorage** — Penyimpanan riwayat tes dan preferensi tema
- **Intl API** — Deteksi timezone pengguna

---

## 🌐 API yang Digunakan

### 1. Speed Test — Cloudflare Speed

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `speed.cloudflare.com/__down?bytes={size}` | GET | Download speed test |
| `speed.cloudflare.com/__up` | POST | Upload speed test |
| `www.cloudflare.com/cdn-cgi/trace` | GET | Ping test & IP detection |

- **Gratis**, tanpa API key
- **Tidak ada rate limit** yang ketat
- **CORS-friendly** — Bisa dipanggil langsung dari browser

### 2. Weather — Open-Meteo API

| Endpoint | Fungsi |
|----------|--------|
| `api.open-meteo.com/v1/forecast` | Data cuaca real-time |

- **Parameter**: `latitude`, `longitude`, `current` (temperature, humidity, weather_code, wind_speed)
- **Gratis**, tanpa API key, tanpa batasan
- **Open source** weather API

### 3. IP Detection — 6 Strategi Fallback

Sistem deteksi IP menggunakan 6 API secara berurutan (fallback chain) untuk memastikan keberhasilan:

| Prioritas | API | Endpoint | Data |
|-----------|-----|----------|------|
| 1️⃣ | **Cloudflare Trace** | `cloudflare.com/cdn-cgi/trace` | IP, Country code |
| 2️⃣ | **ipapi.co** | `ipapi.co/json/` | IP, ISP, City, Country, Lat/Lon |
| 3️⃣ | **ipwho.is** | `ipwho.is/` | IP, ISP, City, Country, Lat/Lon |
| 4️⃣ | **ipify.org** | `api.ipify.org?format=json` | IP only |
| 5️⃣ | **ip-api.com** | `ip-api.com/json/` | IP, ISP, City, Country, Lat/Lon |
| 6️⃣ | **freeipapi.com** | `freeipapi.com/api/json` | IP, ISP, City, Country, Lat/Lon |

> Jika semua API gagal, sistem menggunakan **Browser Geolocation API** sebagai last resort untuk mendapatkan koordinat cuaca.

---

## 📁 Struktur Project

```
netpulse-speedtest/
├── index.html          # Halaman utama (struktur HTML)
├── style.css           # Semua styling & tema (1200+ baris)
├── script.js           # Logika aplikasi (700+ baris)
├── package.json        # Konfigurasi project
└── README.md           # Dokumentasi (file ini)
```

### Detail File

#### `index.html` (~240 baris)
- Struktur semantik HTML5
- Background layers (gradient, grid, overlay)
- Canvas untuk animasi partikel
- Theme switcher buttons
- Widget row (Clock, Weather, IP)
- Speed test card (header, phase indicator, gauge, results, start button)
- History panel (slide-in sidebar)

#### `style.css` (~1270 baris)
- 4 tema warna dengan CSS Custom Properties
- Reset & base styles
- Background effects (gradient, grid, overlay)
- Glassmorphism widgets
- SVG gauge styling
- Animasi (pulse, glow, slide, scan)
- Responsive design (3 breakpoints)
- History panel slide animation

#### `script.js` (~700 baris)
- **initClock()** — Jam digital real-time
- **initThemeSwitcher()** — Manajemen tema
- **initParticles()** — Animasi partikel Canvas
- **initGauge()** — SVG gauge meter dengan gradient
- **realPingTest()** — 20 iterasi ping ke Cloudflare
- **realDownloadTest()** — Streaming download test (5 ukuran file)
- **realUploadTest()** — Upload test (5 ukuran data)
- **fetchIPInfo()** — 6 strategi fallback IP detection
- **fetchWeather()** — Cuaca via Open-Meteo API
- **History system** — Save/load/render/clear via localStorage

---

## 🚀 Cara Menjalankan

### Opsi 1: Buka Langsung
```bash
# Cukup buka file index.html di browser
open index.html
```

### Opsi 2: Local Server
```bash
# Menggunakan Python
python -m http.server 8080

# Menggunakan Node.js (npx)
npx serve .

# Menggunakan PHP
php -S localhost:8080
```

### Opsi 3: Deploy
Upload ketiga file (`index.html`, `style.css`, `script.js`) ke hosting manapun:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Hosting tradisional

---

## 📖 Detail Fitur

### 🏎️ Speed Test Engine

#### Ping Test
- Mengirim **20 iterasi** request ke `cloudflare.com/cdn-cgi/trace`
- Menggunakan `performance.now()` untuk presisi sub-millisecond
- **Trimmed mean** — Membuang 10% outlier tertinggi dan terendah
- Menghitung **jitter** dari variasi antar-ping
- Fallback ke `mode: 'no-cors'` jika CORS gagal

#### Download Test
- Mengunduh file dari Cloudflare dengan 5 ukuran bertahap: 100KB → 1MB → 5MB → 10MB → 25MB
- **Real-time streaming** menggunakan `ReadableStream` API
- Gauge meter update secara live saat download berlangsung
- Batas waktu maksimal **10 detik**
- Adaptive: skip ke ukuran besar jika kecepatan > 100 Mbps

#### Upload Test
- Mengirim data ke Cloudflare dengan 5 ukuran: 100KB → 500KB → 1MB → 2MB → 5MB
- Menggunakan `ArrayBuffer` dan `Blob` untuk data payload
- Batas waktu maksimal **10 detik**
- Fallback ke ukuran lebih kecil jika gagal

#### Kalkulasi Hasil
- **Download/Upload**: Trimmed mean (buang nilai terendah jika > 2 sampel)
- **Ping**: Trimmed mean (buang 10% outlier atas dan bawah)
- **Jitter**: Rata-rata selisih absolut antar ping berurutan

### 🌤️ Weather System

1. **Immediate fallback**: Saat halaman dimuat, langsung ambil cuaca berdasarkan timezone
2. **Timezone mapping**: 35+ timezone dipetakan ke koordinat kota terdekat
3. **IP-based update**: Jika IP detection berhasil mendapat koordinat, cuaca di-update
4. **Browser geolocation**: Last resort jika semua API gagal

### 🌐 IP Detection Chain

Sistem menggunakan **progressive enhancement**:
1. Mulai dari API paling reliable (Cloudflare)
2. Jika data belum lengkap (`partial: true`), lanjut ke API berikutnya
3. Berhenti begitu mendapat data lengkap (IP + ISP + lokasi + koordinat)
4. Setiap request memiliki **timeout** (5-6 detik) via `AbortController`

### 🎨 Theme System

4 tema tersedia, masing-masing mendefinisikan 30+ CSS custom properties:

| Tema | Warna Utama | Aksen |
|------|-------------|-------|
| **Cyber Blue** | `#38bdf8` | Blue → Purple → Orange |
| **Neon Green** | `#4ade80` | Green → Cyan → Pink |
| **Purple Haze** | `#a78bfa` | Purple → Pink → Orange |
| **Sunset Orange** | `#fb923c` | Orange → Pink → Purple |

Preferensi tema disimpan di `localStorage` dan di-restore saat halaman dimuat ulang.

### ✨ Particle System

- **50 partikel** dengan gerakan random
- Setiap partikel memiliki: posisi, ukuran, kecepatan, opacity, fade direction
- **Connection lines** antara partikel yang berdekatan (< 120px)
- Warna partikel mengikuti tema aktif
- **Dinonaktifkan di mobile** untuk performa

---

## 🎨 Kustomisasi

### Menambah Tema Baru

Tambahkan di `style.css`:

```css
[data-theme="custom"] {
    --bg-primary: #your-color;
    --accent: #your-accent;
    --accent-rgb: R, G, B;
    /* ... definisikan semua 30+ variabel */
}
```

Tambahkan button di `index.html`:

```html
<button class="theme-btn" data-theme="custom" title="Custom Theme">
    <span class="theme-dot" style="background: linear-gradient(135deg, #color1, #color2);"></span>
</button>
```

### Mengubah Server Test

Ganti URL di `script.js`:

```javascript
// Download
const url = 'https://your-server.com/download-endpoint';

// Upload
const url = 'https://your-server.com/upload-endpoint';

// Ping
const url = 'https://your-server.com/ping-endpoint';
```

### Mengubah Jumlah Partikel

Di `script.js`, ubah:

```javascript
const PARTICLE_COUNT = 50; // Ubah sesuai keinginan
```

---

## 🌐 Browser Support

| Browser | Versi Minimum | Status |
|---------|---------------|--------|
| Chrome | 66+ | ✅ Full Support |
| Firefox | 57+ | ✅ Full Support |
| Safari | 12.1+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| Opera | 53+ | ✅ Full Support |
| Mobile Chrome | 66+ | ✅ Full Support |
| Mobile Safari | 12.2+ | ✅ Full Support |

> **Catatan**: Animasi `backdrop-filter` mungkin tidak tersedia di browser lama. Aplikasi tetap berfungsi normal tanpa efek glassmorphism.

---

## 📊 Performa

- **Zero dependencies** — Tidak ada library eksternal yang perlu dimuat
- **Total size**: ~35KB (HTML + CSS + JS, uncompressed)
- **First paint**: < 500ms
- **Fully interactive**: < 1s
- **Lighthouse score**: 90+ (Performance, Accessibility, Best Practices)

---

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">
  Made with ⚡ by <strong>Sobing4413</strong>
</p>
