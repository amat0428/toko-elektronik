// Data Produk
const productsData = [
  {
    id: 1,
    title: "Laptop Gaming RGB 15 Inch High Performance",
    price: "Rp 12.500.000",
    rating: "4.9",
    sold: "1.2rb",
    badge: "Star+",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400"
  },
  {
    id: 2,
    title: "Smartphone 5G 128GB Camera Ultra Clear",
    price: "Rp 4.500.000",
    rating: "4.8",
    sold: "850",
    badge: "Star",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  },
  {
    id: 3,
    title: "TWS Wireless Earbuds Pro Bass Boost",
    price: "Rp 350.000",
    rating: "4.7",
    sold: "3.4rb",
    badge: "Official",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"
  },
  {
    id: 4,
    title: "Smartwatch Sport Edition Water Resistant",
    price: "Rp 850.000",
    rating: "4.9",
    sold: "500+",
    badge: "Star+",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
  },
  {
    id: 5,
    title: "Headphone Bluetooth Over-Ear ANC Premium",
    price: "Rp 620.000",
    rating: "4.8",
    sold: "1.1rb",
    badge: "Mall",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  },
  {
    id: 6,
    title: "Keyboard Mechanical Wireless RGB Swappable",
    price: "Rp 750.000",
    rating: "4.9",
    sold: "2.1rb",
    badge: "Star+",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"
  },
  {
    id: 7,
    title: "Mouse Gaming Wireless Light Speed 16000 DPI",
    price: "Rp 420.000",
    rating: "4.8",
    sold: "950",
    badge: "Star",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400"
  },
  {
    id: 8,
    title: "Kamera Mirrorless 4K Vlogging Kit Ultra HD",
    price: "Rp 8.900.000",
    rating: "5.0",
    sold: "300+",
    badge: "Official",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400"
  },
  {
    id: 9,
    title: "Speaker Bluetooth Portable Waterproof Heavy Bass",
    price: "Rp 290.000",
    rating: "4.6",
    sold: "4.5rb",
    badge: "Mall",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"
  },
  {
    id: 10,
    title: "Monitor Gaming Lengkung 144Hz 27 Inch Full HD",
    price: "Rp 2.850.000",
    rating: "4.9",
    sold: "720",
    badge: "Star+",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"
  }
];

// Fungsi Render Produk
function renderProducts(items) {
  const container = document.getElementById('product-list');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-gray-400">
        <i class="fa-solid fa-magnifying-glass text-4xl mb-2"></i>
        <p class="text-sm font-semibold">Produk tidak ditemukan</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(product => `
    <a href="product-detail.html?id=${product.id}" class="bg-white rounded-lg border border-gray-100 hover:border-blue-600 transition shadow-sm overflow-hidden flex flex-col justify-between group">
      <div>
        <div class="h-44 bg-gray-100 flex items-center justify-center relative overflow-hidden">
          <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          <span class="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            ${product.badge}
          </span>
        </div>
        <div class="p-2.5">
          <p class="text-xs md:text-sm text-gray-800 line-clamp-2 mb-2 font-medium group-hover:text-blue-600 transition">
            ${product.title}
          </p>
          <p class="text-blue-600 font-bold text-sm md:text-base">${product.price}</p>
        </div>
      </div>
      <div class="p-2.5 pt-0 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-50 mt-1">
        <span><i class="fa-solid fa-star text-yellow-400"></i> ${product.rating}</span>
        <span>${product.sold} Terjual</span>
      </div>
    </a>
  `).join('');
}

// Inisialisasi & Fitur Search
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(productsData);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = productsData.filter(item => 
        item.title.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    });
  }
});