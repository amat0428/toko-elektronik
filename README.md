# 🛒 Toko Elektronik Web App

Aplikasi web toko elektronik responsif dan modern berbasis **HTML5**, **CSS3**, **JavaScript (Vanilla)**, serta **Vercel Serverless Functions (`/api`)** yang siap di-deploy secara langsung ke platform Vercel.

---

## 🚀 Fitur Utama

- 🔐 **Autentikasi Pengguna:** Login (`/login.html`) & Register (`/register.html`) terhubung dengan backend Serverless API (`/api/auth`).
- 📱 **Katalog Produk:** Menampilkan daftar produk elektronik (`/products.html`) & detail spesifikasi (`/product-detail.html`).
- 🛒 **Keranjang Belanja:** Manajemen item keranjang belanja secara langsung melalui `cart.js`.
- 💳 **Checkout & Pesanan:** Proses checkout pesanan (`/checkout.html`) dan riwayat pesanan pengguna (`/orders.html`).
- 🛡️ **Panel Admin:** Dashboard khusus admin (`/admin/dashboard.html`), manajemen produk, dan kelola pesanan masuk.
- ⚡ **Deploy-Ready:** Sudah terkonfigurasi untuk deployment instan via Vercel Serverless Architecture.

---

## 📂 Struktur Proyek

```text
toko-elektronik/
├── api/                    # Backend API (Vercel Serverless Functions)
│   ├── auth/               # Auth endpoints (login.js, register.js)
│   ├── orders/             # Order management (index.js)
│   ├── products/           # Product endpoints (index.js, detail.js)
│   └── checkout.js         # Transaction processing
├── public/                 # Frontend Static Files
│   ├── admin/              # Admin Pages (dashboard.html, orders.html, products.html)
│   ├── css/                # Stylesheet (style.css)
│   ├── js/                 # Client Logic (app.js, auth.js, cart.js, checkout.js, products.js)
│   └── *.html              # Halaman Utama (index, login, register, cart, checkout, dll)
├── package.json            # Node.js Config & Dependencies
├── vercel.json             # Konfigurasi Routing Deployment Vercel
└── README.md               # Dokumentasi Repositori