const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function formatRupiah(number) {
  return 'Rp ' + Number(number || 0).toLocaleString('id-ID');
}

document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkout-form');
  const summaryContainer = document.getElementById('checkout-summary');

  // Ambil barang yang dipilih dari cart.js (atau ambil seluruh cart jika tidak ada)
  let checkoutCart = JSON.parse(localStorage.getItem('checkoutItems'));
  if (!checkoutCart || checkoutCart.length === 0) {
    const fullCart = JSON.parse(localStorage.getItem('cart') || '[]');
    checkoutCart = fullCart.filter(item => item.selected !== false);
  }

  const total = checkoutCart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // 1. Tampilkan Ringkasan Pesanan
  if (summaryContainer) {
    if (checkoutCart.length === 0) {
      summaryContainer.innerHTML = '<p class="text-gray-500">Tidak ada produk yang dipilih untuk di-checkout.</p>';
    } else {
      const itemsListHtml = checkoutCart.map(item => `
        <div class="flex justify-between text-xs md:text-sm py-1 border-b border-gray-100">
          <span>${item.title} (x${item.qty})</span>
          <span class="font-semibold">${formatRupiah(item.price * item.qty)}</span>
        </div>
      `).join('');

      summaryContainer.innerHTML = `
        <h3 class="font-bold text-base mb-2">Ringkasan Pesanan</h3>
        <div class="mb-3">${itemsListHtml}</div>
        <p class="text-xs text-gray-600">Total Item: ${checkoutCart.reduce((a, b) => a + b.qty, 0)}</p>
        <h4 class="text-sm md:text-base font-bold text-blue-600 mt-1">Total Bayar: ${formatRupiah(total)}</h4>
      `;
    }
  }

  // 2. Proses Submit Form Checkout ke Supabase
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (checkoutCart.length === 0) {
        alert('Keranjang belanja kosong atau tidak ada produk yang dipilih!');
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        alert("Silakan login terlebih dahulu untuk melanjutkan checkout!");
        window.location.href = "login.html";
        return;
      }

      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Memproses Pesanan...';
      }

      const customerInfo = {
        name: document.getElementById('name') ? document.getElementById('name').value : currentUser.name,
        address: document.getElementById('address') ? document.getElementById('address').value : '',
        phone: document.getElementById('phone') ? document.getElementById('phone').value : ''
      };

      try {
        // Kirim data langsung ke tabel orders di Supabase
        const { data, error } = await _supabase
          .from('orders')
          .insert([{
            user_id: currentUser.id,
            user_name: customerInfo.name || currentUser.email,
            items: JSON.stringify(checkoutCart),
            total_harga: total,
            status: 'Menunggu Konfirmasi'
          }])
          .select();

        if (error) throw error;

        alert('Checkout Berhasil! Pesanan Anda telah dibuat.');

        // Update keranjang: hapus item yang baru saja dibeli
        let fullCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const boughtIds = checkoutCart.map(i => i.id);
        fullCart = fullCart.filter(item => !boughtIds.includes(item.id));
        
        localStorage.setItem('cart', JSON.stringify(fullCart));
        localStorage.removeItem('checkoutItems');

        window.location.href = 'orders.html';

      } catch (err) {
        alert('Gagal melakukan checkout: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Buat Pesanan';
        }
      }
    });
  }
});