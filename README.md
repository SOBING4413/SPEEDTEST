# ⚡ NetPulse - Real Speed Test

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/HTML-CSS-JS-orange?style=for-the-badge" alt="Tech Stack">
</p>

<p align="center">
  Aplikasi speed test internet modern dengan antarmuka futuristik, dibangun menggunakan HTML, CSS, dan JavaScript murni. Mengukur kecepatan Download, Upload, Ping, dan Jitter secara real-time menggunakan server Cloudflare CDN.
</p>

---

## 🎯 Fitur Utama

### 🚀 Speed Test
- **Download Speed** — Mengukur kecepatan unduh menggunakan Cloudflare CDN (`cloudflare.com/cdn-cgi/trace`)
- **Upload Speed** — Mengukur kecepatan unggah dengan mengirim data ke Cloudflare
- **Ping** — Mengukur latensi jaringan (rata-rata dari beberapa pengujian)
- **Jitter** — Mengukur variasi latensi untuk menilai stabilitas koneksi

### 📊 Visualisasi Real-Time
- **Gauge Speedometer** — Speedometer SVG animasi yang menampilkan kecepatan secara langsung dengan tick marks dan progress arc
- **Live Graph** — Grafik canvas real-time yang menampilkan perubahan kecepatan selama pengujian berlangsung
- **Phase Indicator** — Indikator tahapan tes bertahap: `Ping → Download → Upload` dengan status aktif/selesai
- **Progress Bar** — Bar progres dengan informasi waktu berjalan dan persentase penyelesaian

### 🎨 4 Tema Warna
| Tema | Warna |
|------|-------|
| 🔵 **Cyber Blue** | Biru futuristik (default) |
| 🟢 **Neon Green** | Hijau neon |
| 🟣 **Purple Haze** | Ungu elegan |
| 🟠 **Sunset Orange** | Oranye sunset |

Tema dapat diubah kapan saja melalui tombol theme switcher di pojok kanan atas.

### 🕐 Widget Jam (Clock)
- Menampilkan waktu real-time (format HH:MM:SS)
- Tanggal lengkap (hari, tanggal, bulan, tahun)
- Badge timezone otomatis (contoh: `UTC+7`)

### 🌤️ Widget Cuaca (Weather)
- Data cuaca langsung dari API **wttr.in**
- Menampilkan suhu, deskripsi cuaca, emoji cuaca
- Detail kelembapan (humidity) dan kecepatan angin (wind speed)
- Deteksi lokasi otomatis berdasarkan IP

### 🌐 Widget Info IP
- Deteksi IP publik otomatis via **ipapi.co**
- Menampilkan nama ISP (Internet Service Provider)
- Menampilkan lokasi (Kota, Negara)

### 📋 Riwayat Tes (History)
- Menyimpan hasil tes secara otomatis ke **LocalStorage** browser
- Panel riwayat dengan daftar hasil tes sebelumnya
- Menampilkan: tanggal/waktu, download, upload, ping, jitter
- Tombol **Clear All** untuk menghapus semua riwayat
- Maksimum 20 entri riwayat tersimpan

### ✨ Efek Visual
- **Particle Canvas** — Animasi partikel bergerak di background
- **Neon Border & Glow Effects** — Efek cahaya neon pada card utama
- **Grid Background** — Latar belakang grid futuristik
- **Smooth Animations** — Transisi dan animasi halus pada semua elemen

---

## 🛠️ Teknologi

| Teknologi | Keterangan |
|-----------|------------|
| **HTML5** | Struktur halaman |
| **CSS3** | Styling, animasi, tema, responsive design |
| **JavaScript (Vanilla)** | Logika speed test, widget, grafik, partikel |
| **Google Fonts** | Font Inter & Orbitron |
| **Cloudflare CDN** | Server untuk pengujian kecepatan |
| **wttr.in API** | Data cuaca real-time |
| **ipapi.co API** | Deteksi IP dan lokasi |

---

## 📁 Struktur File

```
SPEEDTEST/
├── index.html      # Halaman utama (struktur HTML)
├── style.css       # Stylesheet (tema, animasi, responsive)
├── script.js       # Logika aplikasi (speed test, widget, grafik)
└── README.md       # Dokumentasi proyek
```

---

## 🚀 Cara Menggunakan

### Opsi 1: Buka Langsung
1. Clone atau download repository ini
   ```bash
   git clone https://github.com/SOBING4413/SPEEDTEST.git
   ```
2. Buka file `index.html` di browser

### Opsi 2: Live Server
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan pada `index.html` → **Open with Live Server**

### Opsi 3: Deploy Online
Deploy gratis ke platform seperti:
- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)

---

## 🎮 Cara Kerja Speed Test

1. **Klik tombol "START TEST"** untuk memulai pengujian
2. **Fase Ping** — Mengirim beberapa request ke Cloudflare dan mengukur waktu respons rata-rata serta jitter
3. **Fase Download** — Mengunduh data dari Cloudflare CDN dan menghitung kecepatan berdasarkan ukuran data dan waktu
4. **Fase Upload** — Mengunggah blob data ke Cloudflare dan mengukur kecepatan upload
5. **Hasil** — Ditampilkan pada panel hasil dan disimpan otomatis ke riwayat

> ⚠️ **Catatan:** Hasil pengujian bersifat estimasi. Kecepatan aktual dapat bervariasi tergantung kondisi jaringan, jarak ke server, dan beban jaringan saat pengujian.

---

## 📱 Responsive Design

Aplikasi ini sepenuhnya responsive dan dapat digunakan di:
- 🖥️ Desktop
- 💻 Laptop
- 📱 Tablet & Smartphone

---

## 📄 Lisensi

Proyek ini bersifat open-source. Silakan gunakan dan modifikasi sesuai kebutuhan.

---

<p align="center">
  Made with ⚡ by <strong>NetPulse</strong>
</p>
