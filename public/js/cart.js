function renderCart() {
  const container = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  if (cart.length === 0) {
    container.innerHTML = '<p>Keranjang belanja kamu masih kosong.</p>';
    if (totalElement) totalElement.innerText = formatRupiah(0);
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" width="60" alt="${item.name}">
        <div class="info">
          <h4>${item.name}</h4>
          <p>${formatRupiah(item.price)} x ${item.qty}</p>
        </div>
        <div class="item-actions">
          <button onclick="changeQty(${index}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
          <button onclick="removeItem(${index})" class="btn-danger">Hapus</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalElement) totalElement.innerText = formatRupiah(total);
}

function changeQty(index, change) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart[index].qty += change;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', renderCart);