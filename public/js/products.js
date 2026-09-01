// Local fallback products
const defaultProducts = [
  { id: "1", name: "Laptop Gaming RGB 15 Inch", price: 12500000, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60" },
  { id: "2", name: "Smartphone 5G 128GB", price: 4500000, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60" },
  { id: "3", name: "TWS Wireless Earbuds Pro", price: 350000, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60" },
  { id: "4", name: "Smartwatch Sport Edition", price: 850000, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" }
];

async function loadProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;

  let products = defaultProducts;
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const result = await res.json();
      if (result.data) products = result.data;
    }
  } catch (err) {
    console.warn("API offline, menggunakan data lokal:", err);
  }

  container.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">${formatRupiah(p.price)}</p>
      <div class="actions">
        <a href="product-detail.html?id=${p.id}" class="btn btn-secondary">Detail</a>
        <button onclick="addToCart('${p.id}', '${p.name}', ${p.price}, '${p.image}')" class="btn btn-primary">+ Keranjang</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  alert(`${name} ditambahkan ke keranjang!`);
}

document.addEventListener('DOMContentLoaded', loadProducts);