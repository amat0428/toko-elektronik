// Sample Data Keranjang (Mocking data jika belum dari Database)
let cartData = [
  {
    id: 1,
    title: "Laptop Gaming RGB 15 Inch High Performance",
    price: 12500000,
    qty: 1,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
    selected: true
  },
  {
    id: 3,
    title: "TWS Wireless Earbuds Pro Bass Boost",
    price: 350000,
    qty: 2,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    selected: true
  }
];

function formatRupiah(number) {
  return 'Rp ' + number.toLocaleString('id-ID');
}

function renderCart() {
  const cartList = document.getElementById('cartItemsList');
  const cartContent = document.getElementById('cartContent');
  const emptyCart = document.getElementById('emptyCart');

  if (!cartData || cartData.length === 0) {
    cartContent.classList.add('hidden');
    emptyCart.classList.remove('hidden');
    return;
  }

  cartContent.classList.remove('hidden');
  emptyCart.classList.add('hidden');

  cartList.innerHTML = cartData.map(item => `
    <div class="bg-white p-3.5 rounded-lg shadow-sm flex items-center gap-3 border border-gray-100">
      <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="toggleSelect(${item.id})" class="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0">
      
      <img src="${item.image}" alt="${item.title}" class="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-gray-100 shrink-0">
      
      <div class="flex-1 min-w-0">
        <p class="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 leading-snug">${item.title}</p>
        <p class="text-blue-600 font-bold text-xs md:text-sm mt-1">${formatRupiah(item.price)}</p>
      </div>

      <div class="flex flex-col items-end gap-2 shrink-0">
        <button onclick="removeItem(${item.id})" class="text-gray-400 hover:text-red-500 text-xs transition">
          <i class="fa-solid fa-trash"></i>
        </button>
        <div class="flex items-center border border-gray-200 rounded overflow-hidden text-xs">
          <button onclick="updateQty(${item.id}, -1)" class="px-2 py-1 bg-gray-50 hover:bg-gray-200 font-bold text-gray-600">-</button>
          <span class="px-2.5 py-1 font-semibold text-gray-700">${item.qty}</span>
          <button onclick="updateQty(${item.id}, 1)" class="px-2 py-1 bg-gray-50 hover:bg-gray-200 font-bold text-gray-600">+</button>
        </div>
      </div>
    </div>
  `).join('');

  updateSummary();
}

function updateQty(id, change) {
  const item = cartData.find(i => i.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cartData = cartData.filter(i => i.id !== id);
    }
  }
  renderCart();
}

function removeItem(id) {
  cartData = cartData.filter(i => i.id !== id);
  renderCart();
}

function toggleSelect(id) {
  const item = cartData.find(i => i.id === id);
  if (item) item.selected = !item.selected;
  renderCart();
}

function updateSummary() {
  const selectedItems = cartData.filter(i => i.selected);
  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const count = selectedItems.reduce((sum, item) => sum + item.qty, 0);

  document.getElementById('totalItemCount').innerText = cartData.length;
  document.getElementById('selectedCount').innerText = count;
  document.getElementById('subtotalPrice').innerText = formatRupiah(total);
  document.getElementById('totalPrice').innerText = formatRupiah(total);

  const selectAllBtn = document.getElementById('selectAll');
  if (selectAllBtn) {
    selectAllBtn.checked = cartData.length > 0 && cartData.every(i => i.selected);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const selectAllBtn = document.getElementById('selectAll');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      cartData.forEach(item => item.selected = isChecked);
      renderCart();
    });
  }

  const deleteSelectedBtn = document.getElementById('deleteSelected');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', () => {
      cartData = cartData.filter(item => !item.selected);
      renderCart();
    });
  }
});