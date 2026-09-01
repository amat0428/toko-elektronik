// Utility Helper untuk Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Update Keranjang Badge di Navbar
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    badge.innerText = totalQty;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});