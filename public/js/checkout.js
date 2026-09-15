const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxMjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';

// Inisialisasi Supabase client aman
let _supabase = null;
if (typeof supabase !== 'undefined') {
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.error("Supabase SDK belum dimuat di HTML!");
}

// Helper ambil data keranjang terbaru
function getCartData() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const selectedItems = cart.filter(item => item.selected !== false);
  const totalPrice = selectedItems.reduce((sum, item) => {
    const itemPrice = Number(item.price || item.harga || 0);
    const itemQty = Number(item.qty || 1);
    return sum + (itemPrice * itemQty);
  }, 0);

  return { cart, selectedItems, totalPrice };
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tampilkan Total Harga awal
  const { totalPrice: initialTotal } = getCartData();
  const checkoutTotalEl = document.getElementById('checkoutTotal');
  if (checkoutTotalEl) {
    checkoutTotalEl.innerText = 'Rp ' + Number(initialTotal).toLocaleString('id-ID');
  }

  // 2. Autofill nama user jika sedang login
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const currentUser = JSON.parse(userData);
      const inputNama = document.getElementById('namaLengkap');
      if (currentUser && (currentUser.name || currentUser.user_name) && inputNama) {
        inputNama.value = currentUser.name || currentUser.user_name;
      }
    } catch (e) {
      console.error("Gagal membaca session user:", e);
    }
  }

  // 3. Proses Checkout
  const checkoutForm = document.getElementById('checkoutForm');
  const btnBayar = document.getElementById('btnBayar');

  const processCheckout = async (e) => {
    if (e) e.preventDefault();

    if (!_supabase) {
      alert('Library Supabase gagal dimuat. Periksa koneksi internet!');
      return;
    }

    const { cart, selectedItems, totalPrice } = getCartData();

    if (selectedItems.length === 0) {
      alert('Keranjang Anda kosong atau belum ada produk yang dipilih!');
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
      alert('Harap isi semua kolom nama, nomor HP, dan alamat pengiriman!');
      return;
    }

    const userSession = localStorage.getItem('user');
    let userId = 'GUEST';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        userId = parsed.id || parsed.user_id || 'GUEST';
      } catch (err) {
        userId = 'GUEST';
      }
    }

    try {
      if (btnBayar) {
        btnBayar.disabled = true;
        btnBayar.innerText = 'Memproses Pesanan...';
      }

      const payload = {
        user_id: String(userId),
        user_name: nama,
        nomor_hp: nohp,
        alamat: alamat,
        total_harga: totalPrice,
        items: selectedItems,
        status: 'Menunggu Konfirmasi'
      };

      const { data, error } = await _supabase.from('orders').insert([payload]).select();

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      // Hapus produk yang dibeli dari localStorage
      const remainingCart = cart.filter(item => item.selected === false);
      localStorage.setItem('cart', JSON.stringify(remainingCart));

      alert('Pesanan berhasil dibuat!');
      window.location.href = 'orders.html';

    } catch (err) {
      console.error("Detail Error:", err);
      alert('Gagal memproses pesanan: ' + (err.message || 'Periksa koneksi atau struktur tabel Supabase'));
      
      if (btnBayar) {
        btnBayar.disabled = false;
        btnBayar.innerText = 'Konfirmasi & Bayar';
      }
    }
  };

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processCheckout);
  } else if (btnBayar) {
    btnBayar.addEventListener('click', processCheckout);
  }
});