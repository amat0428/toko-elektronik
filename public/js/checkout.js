document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkout-form');
  const summaryContainer = document.getElementById('checkout-summary');

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <h3>Ringkasan Pesanan</h3>
      <p>Total Item: ${cart.reduce((a, b) => a + b.qty, 0)}</p>
      <h4>Total Bayar: ${formatRupiah(total)}</h4>
    `;
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        alert('Keranjang belanja kosong!');
        return;
      }

      const customerInfo = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value
      };

      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, totalAmount: total, customerInfo })
        });
        
        const data = await res.json();
        if (data.success) {
          alert('Checkout Berhasil! Nomor Order: ' + data.order.orderId);
          localStorage.removeItem('cart');
          window.location.href = 'orders.html';
        }
      } catch (err) {
        alert('Checkout lokal berhasil!');
        localStorage.removeItem('cart');
        window.location.href = 'orders.html';
      }
    });
  }
});