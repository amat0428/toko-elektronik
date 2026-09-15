const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxMjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Ambil data terbaru dari localStorage saat halaman di-load
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let selectedItems = cart.filter(item => item.selected !== false);
  let totalPrice = selectedItems.reduce((sum, item) => sum + ((item.price || item.harga || 0) * (item.qty || 1)), 0);

  // 2. Tampilkan Total Harga di UI
  const checkoutTotalEl = document.getElementById('checkoutTotal');
  if (checkoutTotalEl) {
    checkoutTotalEl.innerText = 'Rp ' + Number(totalPrice).toLocaleString('id-ID');
  }

  // 3. Autofill Nama jika user sudah login
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const currentUser = JSON.parse(userData);
      const inputNama = document.getElementById('namaLengkap');
      if (currentUser.name && inputNama && !inputNama.value) {
        inputNama.value = currentUser.name;
      }
    } catch (e) {
      console.error("Error parsing user data", e);
    }
  }

  // 4. Handle Penanganan Form / Tombol Bayar
  const checkoutForm = document.getElementById('checkoutForm');
  const btnBayar = document.getElementById('btnBayar');

  // Fungsi Eksekusi Checkout
  async function prosesCheckout(e) {
    if (e) e.preventDefault(); // Mencegah reload browser

    // Re-fetch data keranjang terbaru saat tombol diklik
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    selectedItems = cart.filter(item => item.selected !== false);
    totalPrice = selectedItems.reduce((sum, item) => sum + ((item.price || item.harga || 0) * (item.qty || 1)), 0);

    if (selectedItems.length === 0) {
      alert('Keranjang Anda kosong atau tidak ada item yang dipilih!');
      window.location.href = 'cart.html';
      return;
    }

    const inputNama = document.getElementById('namaLengkap');
    const inputHp = document.getElementById('nomorHp');
    const inputAlamat = document.getElementById('alamatPengiriman');

    const nama = inputNama ? inputNama.value.trim() : '';
    const nohp = inputHp ? inputHp.value.trim() : '';
    const alamat = inputAlamat ? inputAlamat.value.trim() : '';

    if (!nama || !nohp || !alamat) {
      alert('Harap isi semua kolom form!');
      return;
    }

    const userData = localStorage.getItem('user');
    const currentUser = userData ? JSON.parse(userData) : { id: 'GUEST', name: nama };

    try {
      if (btnBayar) {
        btnBayar.disabled = true;
        btnBayar.innerText = 'Memproses Pesanan...';
      }

      // Payload insert ke Supabase
      const payload = {
        user_id: String(currentUser.id || 'GUEST'),
        user_name: nama,
        nomor_hp: nohp,
        alamat: alamat,
        total_harga: totalPrice,
        items: selectedItems,
        status: 'Menunggu Konfirmasi'
      };

      const { data, error } = await _supabase.from('orders').insert([payload]).select();

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error;
      }

      // Hapus item yang sudah di-checkout dari localStorage
      const remainingCart = cart.filter(item => item.selected === false);
      localStorage.setItem('cart', JSON.stringify(remainingCart));

      alert('Pesanan berhasil dibuat!');
      window.location.href = 'orders.html';

    } catch (err) {
      console.error(err);
      alert('Gagal memproses pesanan: ' + (err.message || 'Periksa koneksi/struktur tabel Supabase'));
      if (btnBayar) {
        btnBayar.disabled = false;
        btnBayar.innerText = 'Konfirmasi & Bayar';
      }
    }
  }

  // Pasang Event Listener ke Form & Tombol
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', prosesCheckout);
  } else if (btnBayar) {
    btnBayar.addEventListener('click', prosesCheckout);
  }
});