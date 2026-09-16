const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';

let _supabase = null;
if (typeof supabase !== 'undefined') {
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('Supabase SDK belum dimuat.');
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

// Fungsi Menampilkan Modal Nota Pembayaran
function tampilkanNota(order, items, total) {
  const notaNama = document.getElementById('notaNama');
  const notaHp = document.getElementById('notaHp');
  const notaAlamat = document.getElementById('notaAlamat');
  const notaTotal = document.getElementById('notaTotalBayar');
  const notaTanggal = document.getElementById('notaTanggal');
  const notaOrderId = document.getElementById('notaOrderId');
  const modal = document.getElementById('notaModal');

  if (notaNama) notaNama.innerText = order.user_name || '-';
  if (notaHp) notaHp.innerText = order.nomor_hp || '-';
  if (notaAlamat) notaAlamat.innerText = order.alamat || '-';
  if (notaTotal) notaTotal.innerText = 'Rp ' + Number(total).toLocaleString('id-ID');
  if (notaTanggal) notaTanggal.innerText = new Date().toLocaleString('id-ID');
  if (notaOrderId) notaOrderId.innerText = 'ID PESANAN: #' + (order.id || Math.floor(Math.random() * 89999 + 10000));

  const itemsContainer = document.getElementById('notaItemsList');
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    items.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'nota-item-row';
      const price = Number(item.price || item.harga || 0);
      const qty = Number(item.qty || 1);
      itemRow.innerHTML = `
        <span>${item.title || item.nama || 'Produk'} (x${qty})</span>
        <span>Rp ${Number(price * qty).toLocaleString('id-ID')}</span>
      `;
      itemsContainer.appendChild(itemRow);
    });
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

// Fungsi Navigasi saat Selesai dari Modal Nota
window.selesaiCheckout = function() {
  window.location.href = 'orders.html';
};

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

  // 3. Proses Checkout Form
  const checkoutForm = document.getElementById('checkoutForm');
  const btnBayar = document.getElementById('btnBayar');

  const processCheckout = async (e) => {
    if (e) e.preventDefault();

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

    let orderData = payload;

    // Coba simpan ke Supabase jika client siap
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('orders').insert([payload]).select();
        if (error) {
          console.error("Supabase Error:", error);
        } else if (data && data.length > 0) {
          orderData = data[0];
        }
      } catch (err) {
        console.warn("Koneksi Supabase gagal, memproses secara lokal:", err);
      }
    }

    // Hapus produk yang dibeli dari localStorage
    const remainingCart = cart.filter(item => item.selected === false);
    localStorage.setItem('cart', JSON.stringify(remainingCart));

    // SELALU TAMPILKAN NOTA PEMBAYARAN
    tampilkanNota(orderData, selectedItems, totalPrice);
  };

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processCheckout);
  } else if (btnBayar) {
    btnBayar.addEventListener('click', processCheckout);
  }
});