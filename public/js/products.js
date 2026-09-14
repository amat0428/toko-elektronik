// Variabel global untuk menyimpan data produk
let globalProducts = [];

// 1. FUNGSI MENGAMBIL DATA PRODUK DARI SUPABASE (GET)
async function fetchProductsFromAPI() {
  const container = document.getElementById('product-list');
  if (!container) return;

  try {
    const response = await fetch('/api/products');
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      globalProducts = result.data;
    } else if (Array.isArray(result)) {
      globalProducts = result;
    } else {
      globalProducts = [];
    }

    renderProducts(globalProducts);
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-red-500">
        <i class="fa-solid fa-triangle-exclamation text-4xl mb-2"></i>
        <p class="text-sm font-semibold">Gagal memuat produk dari server.</p>
      </div>
    `;
  }
}

// 2. FUNGSI RENDER KARTU PRODUK TAMPILAN ELEGAN WAKTU BIRU
function renderProducts(items) {
  const container = document.getElementById('product-list');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-gray-400">
        <i class="fa-solid fa-magnifying-glass text-4xl mb-2"></i>
        <p class="text-sm font-semibold">Produk tidak ditemukan</p>
      </div>
    `;
    return;
  }

  // Cek Role Admin
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'admin' || currentUser.username === 'admin1@gmail.com';

  container.innerHTML = items.map(product => {
    const title = product.nama || product.title || 'Produk Tanpa Nama';
    const rawPrice = product.harga || product.price || 0;
    const priceFormatted = typeof rawPrice === 'number'
      ? rawPrice.toLocaleString('id-ID')
      : rawPrice;
    
    const badge = product.badge || 'Star+';
    const rating = product.rating || '4.9';
    const stok = product.stok !== undefined ? product.stok : 10;
    const sold = product.sold || `${stok} Stok`;
    const image = product.image || product.gambar || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400';
    const isOutOfStock = stok <= 0;

    return `
      <div class="bg-white rounded-md border border-gray-200 hover:border-blue-600 hover:shadow-md transition duration-200 flex flex-col justify-between group relative overflow-hidden">
        
        <!-- Link Ke Detail -->
        <a href="product-detail.html?id=${product.id}" class="block flex-1">
          <div class="h-44 bg-gray-50 flex items-center justify-center relative overflow-hidden">
            <img src="${image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            
            <!-- Badge Biru -->
            <span class="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              ${badge}
            </span>

            ${isOutOfStock ? `
              <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">STOK HABIS</span>
              </div>
            ` : ''}
          </div>

          <div class="p-2.5 flex flex-col justify-between">
            <p class="text-xs text-gray-800 line-clamp-2 mb-2 font-normal leading-snug group-hover:text-blue-600 transition">
              ${title}
            </p>

            <!-- Harga Warna Biru -->
            <div class="flex items-baseline gap-0.5 mt-1">
              <span class="text-xs text-blue-600 font-semibold">Rp</span>
              <span class="text-blue-600 font-bold text-sm md:text-base leading-none">
                ${priceFormatted}
              </span>
            </div>
          </div>
        </a>

        <!-- Footer Card: Rating & Terjual -->
        <div class="p-2.5 pt-0 flex items-center justify-between text-[10px] text-gray-400 mt-1">
          <span class="flex items-center gap-0.5">
            <i class="fa-solid fa-star text-yellow-400"></i> ${rating}
          </span>
          <span>${sold}</span>
        </div>

        <!-- Tombol Aksi Warna Biru -->
        <div class="p-2 pt-0 border-t border-gray-100 mt-1 flex flex-col gap-1">
          ${!isOutOfStock ? `
            <button onclick="addToCart('${product.id}', '${title.replace(/'/g, "\\'")}', ${rawPrice}, '${image}')" 
              class="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded shadow-xs transition flex items-center justify-center gap-1">
              <i class="fa-solid fa-cart-plus"></i> + Beli
            </button>
          ` : ''}

          ${isAdmin ? `
            <button onclick="deleteProduct('${product.id}')" 
              class="w-full py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded transition">
              <i class="fa-solid fa-trash"></i> Hapus (Admin)
            </button>
          ` : ''}
        </div>

      </div>
    `;
  }).join('');
}

// 3. FUNGSI TAMBAH KE KERANJANG
function addToCart(id, title, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, title, price, image, qty: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  alert('Produk berhasil ditambahkan ke keranjang!');
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.innerText = totalItems;
}

// 4. FUNGSI HAPUS PRODUK (DELETE API)
async function deleteProduct(productId) {
  if (!confirm('Apakah kamu yakin ingin menghapus produk ini?')) return;

  try {
    const response = await fetch(`/api/products?id=${productId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('Produk berhasil dihapus!');
      fetchProductsFromAPI();
    } else {
      alert('Gagal menghapus produk: ' + (result.message || 'Terjadi kesalahan.'));
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Gagal terhubung ke server.');
  }
}

// 5. EVENT LISTENER SAAT HALAMAN DIMUAT
document.addEventListener('DOMContentLoaded', () => {
  fetchProductsFromAPI();
  updateCartBadge();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = globalProducts.filter(item => {
        const title = (item.nama || item.title || '').toLowerCase();
        return title.includes(query);
      });
      renderProducts(filtered);
    });
  }
});