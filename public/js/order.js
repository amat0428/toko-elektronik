const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';
// Ganti dengan API Key anon/public terbaru milikmu jika ada perubahan
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxMjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';

let _supabase = null;
if (typeof supabase !== 'undefined') {
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1. AMBIL DAN TAMPILKAN PROFIL USER
  const userData = localStorage.getItem('user');
  let currentUser = null;

  if (userData) {
    try {
      currentUser = JSON.parse(userData);
      const name = currentUser.name || currentUser.user_name || currentUser.email || 'Pengguna';
      
      const userNameEl = document.getElementById('userName');
      const userInitialEl = document.getElementById('userInitial');
      
      if (userNameEl) userNameEl.innerText = name;
      if (userInitialEl) userInitialEl.innerText = name.charAt(0).toUpperCase();
    } catch (e) {
      console.error("Gagal membaca profil:", e);
    }
  }

  // 2. MUAT DAFTAR PESANAN
  await loadOrders(currentUser);
});

async function loadOrders(user) {
  const container = document.getElementById('ordersContainer');
  let orders = [];

  const userId = user ? (user.id || user.user_id || 'GUEST') : 'GUEST';

  // Ambil dari Supabase jika koneksi siap
  if (_supabase) {
    try {
      let query = _supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (userId !== 'GUEST') {
        query = query.eq('user_id', String(userId));
      }

      const { data, error } = await query;
      if (!error && data) {
        orders = data;
      }
    } catch (err) {
      console.warn("Gagal mengambil orders dari Supabase:", err);
    }
  }

  // Render Pesanan ke UI
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="font-size: 16px; color: #64748b;">Belum ada pesanan yang dibuat.</p>
        <a href="index.html" class="btn-shop">Mulai Belanja</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const dateFormatted = order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : 'Baru saja';
    
    const itemsHtml = items.map(item => `
      <div class="item-row">
        <span>${item.title || item.nama || 'Produk'} (x${item.qty || 1})</span>
        <span>Rp ${Number((item.price || item.harga || 0) * (item.qty || 1)).toLocaleString('id-ID')}</span>
      </div>
    `).join('');

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">ID Pesanan: #${order.id || 'N/A'}</div>
            <div class="order-date">${dateFormatted}</div>
          </div>
          <span class="status-badge ${order.status === 'Selesai' ? 'selesai' : ''}">${order.status || 'Menunggu Konfirmasi'}</span>
        </div>
        <div class="item-list">
          ${itemsHtml}
        </div>
        <div class="order-footer">
          <span>Total Pembayaran:</span>
          <span class="total-price">Rp ${Number(order.total_harga || 0).toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;
  }).join('');
}