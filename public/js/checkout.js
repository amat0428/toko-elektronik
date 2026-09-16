// ============================================
// CHECKOUT - TOKO ELEKTRONIK
// ============================================

// Supabase
const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';

// Gunakan ANON KEY milik project Supabase kamu
const SUPABASE_KEY = 'PASTE_ANON_KEY_KAMU_DI_SINI';

let _supabase = null;

if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}


// ============================================
// FORMAT RUPIAH
// ============================================

function formatRupiah(value) {
    return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
}


// ============================================
// PARSE HARGA
// ============================================

function parsePrice(value) {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        let clean = value
            .replace(/Rp/gi, '')
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '');

        return Number(clean) || 0;
    }

    return 0;
}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ============================================
// AMBIL HARGA PRODUK
// ============================================

function getItemPrice(item) {
    const product = item.product || {};

    const price =
        item.price ??
        item.harga ??
        item.harga_produk ??
        item.product_price ??
        item.price_product ??
        item.selling_price ??
        product.price ??
        product.harga ??
        product.harga_produk ??
        0;

    return parsePrice(price);
}


// ============================================
// AMBIL JUMLAH PRODUK
// ============================================

function getItemQty(item) {
    const product = item.product || {};

    const qty =
        item.qty ??
        item.quantity ??
        item.jumlah ??
        item.kuantitas ??
        product.qty ??
        product.quantity ??
        1;

    const result = Number(qty);

    return result > 0 ? result : 1;
}


// ============================================
// AMBIL NAMA PRODUK
// ============================================

function getItemName(item) {
    const product = item.product || {};

    return (
        item.title ??
        item.nama ??
        item.nama_produk ??
        item.product_name ??
        item.name ??
        product.title ??
        product.nama ??
        product.nama_produk ??
        product.product_name ??
        product.name ??
        'Produk'
    );
}


// ============================================
// AMBIL CART DARI LOCAL STORAGE
// ============================================

function getRawCart() {
    try {
        const raw = localStorage.getItem('cart');

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        if (parsed && Array.isArray(parsed.items)) {
            return parsed.items;
        }

        return [];
    } catch (error) {
        console.error('Gagal membaca cart:', error);
        return [];
    }
}


// ============================================
// AMBIL ITEM YANG DIPILIH
// ============================================

function getCartData() {
    const cart = getRawCart();

    const selectedItems = cart.filter(item => {
        // Kalau tidak ada status selected,
        // anggap produk dipilih
        if (!Object.prototype.hasOwnProperty.call(item, 'selected')) {
            return true;
        }

        return item.selected !== false;
    });

    const items = selectedItems.map(item => {
        const price = getItemPrice(item);
        const qty = getItemQty(item);

        return {
            ...item,
            title: getItemName(item),
            price: price,
            qty: qty,
            subtotal: price * qty
        };
    });

    const total = items.reduce(
        (sum, item) => sum + item.subtotal,
        0
    );

    return {
        items,
        total,
        rawCart: cart
    };
}


// ============================================
// TAMPILKAN ITEM CHECKOUT
// ============================================

function renderCheckoutItems(items) {
    const container = document.getElementById('checkoutItems');

    if (!container) {
        return;
    }

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:#777;
                background:#f8f8f8;
                border-radius:10px;
            ">
                Keranjang kosong
            </div>
        `;

        return;
    }

    container.innerHTML = items.map(item => {
        return `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                padding:15px 0;
                border-bottom:1px solid #eee;
            ">
                <div style="flex:1;">
                    <div style="
                        font-weight:600;
                        color:#222;
                        margin-bottom:5px;
                    ">
                        ${escapeHTML(item.title)}
                    </div>

                    <div style="
                        color:#777;
                        font-size:14px;
                    ">
                        ${formatRupiah(item.price)} × ${item.qty}
                    </div>
                </div>

                <div style="
                    font-weight:700;
                    color:#111;
                    white-space:nowrap;
                ">
                    ${formatRupiah(item.subtotal)}
                </div>
            </div>
        `;
    }).join('');
}


// ============================================
// TAMPILKAN TOTAL
// ============================================

function renderTotal(total) {
    const totalElement = document.getElementById('checkoutTotal');

    if (totalElement) {
        totalElement.textContent = formatRupiah(total);
    }
}


// ============================================
// AMBIL USER LOCAL STORAGE
// ============================================

function getLocalUser() {
    try {
        const raw = localStorage.getItem('user');

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);
    } catch (error) {
        console.error('Gagal membaca user:', error);
        return null;
    }
}


// ============================================
// TAMPILKAN NOTA
// ============================================

function tampilkanNota(order, items, total) {
    const nama =
        document.getElementById('namaLengkap')?.value || '';

    const hp =
        document.getElementById('nomorHp')?.value || '';

    const alamat =
        document.getElementById('alamatPengiriman')?.value || '';

    const notaNama =
        document.getElementById('notaNama');

    const notaHp =
        document.getElementById('notaHp');

    const notaAlamat =
        document.getElementById('notaAlamat');

    const notaTotalBayar =
        document.getElementById('notaTotalBayar');

    const notaTanggal =
        document.getElementById('notaTanggal');

    const notaOrderId =
        document.getElementById('notaOrderId');

    const notaItemsList =
        document.getElementById('notaItemsList');

    const notaModal =
        document.getElementById('notaModal');


    if (notaNama) {
        notaNama.textContent = nama;
    }

    if (notaHp) {
        notaHp.textContent = hp;
    }

    if (notaAlamat) {
        notaAlamat.textContent = alamat;
    }

    if (notaTotalBayar) {
        notaTotalBayar.textContent = formatRupiah(total);
    }

    if (notaTanggal) {
        notaTanggal.textContent =
            new Date().toLocaleString('id-ID');
    }

    if (notaOrderId) {
        notaOrderId.textContent =
            order?.id || '-';
    }


    if (notaItemsList) {
        notaItemsList.innerHTML = items.map(item => `
            <div style="
                display:flex;
                justify-content:space-between;
                padding:8px 0;
                border-bottom:1px solid #eee;
            ">
                <span>
                    ${escapeHTML(item.title)}
                    × ${item.qty}
                </span>

                <strong>
                    ${formatRupiah(item.subtotal)}
                </strong>
            </div>
        `).join('');
    }


    if (notaModal) {
        notaModal.style.display = 'flex';
    }
}


// ============================================
// SELESAI CHECKOUT
// ============================================

window.selesaiCheckout = function () {
    window.location.href = 'orders.html';
};


// ============================================
// CETAK NOTA
// ============================================

window.cetakNota = function () {
    window.print();
};


// ============================================
// PROSES CHECKOUT
// ============================================

async function processCheckout(event) {
    event.preventDefault();

    const button =
        document.getElementById('btnBayar');

    try {

        // ----------------------------------------
        // CEK SUPABASE
        // ----------------------------------------

        if (!_supabase) {
            alert(
                'Supabase belum berhasil dimuat. Silakan refresh halaman.'
            );
            return;
        }


        // ----------------------------------------
        // AMBIL CART
        // ----------------------------------------

        const cartData = getCartData();

        const items = cartData.items;
        const total = cartData.total;
        const rawCart = cartData.rawCart;


        // ----------------------------------------
        // VALIDASI CART
        // ----------------------------------------

        if (!items.length) {
            alert('Keranjang belanja masih kosong.');
            return;
        }

        if (total <= 0) {
            alert('Total belanja tidak valid.');
            console.error('Cart:', rawCart);
            return;
        }


        // ----------------------------------------
        // AMBIL DATA FORM
        // ----------------------------------------

        const nama =
            document.getElementById('namaLengkap')?.value.trim();

        const nomorHp =
            document.getElementById('nomorHp')?.value.trim();

        const alamat =
            document.getElementById('alamatPengiriman')?.value.trim();


        // ----------------------------------------
        // VALIDASI FORM
        // ----------------------------------------

        if (!nama) {
            alert('Nama lengkap wajib diisi.');
            return;
        }

        if (!nomorHp) {
            alert('Nomor HP / WhatsApp wajib diisi.');
            return;
        }

        if (!alamat) {
            alert('Alamat pengiriman wajib diisi.');
            return;
        }


        // ----------------------------------------
        // AMBIL USER
        // ----------------------------------------

        const user = getLocalUser();

        let userId = null;

        if (user) {
            userId =
                user.id ??
                user.user_id ??
                user.uid ??
                null;
        }


        // ----------------------------------------
        // DISABLE BUTTON
        // ----------------------------------------

        if (button) {
            button.disabled = true;
            button.textContent = 'Memproses...';
        }


        // ----------------------------------------
        // DATA ORDER
        // ----------------------------------------

        const payload = {
            user_id: userId,
            user_name: nama,
            nomor_hp: nomorHp,
            alamat: alamat,
            total_harga: total,
            items: items,
            status: 'Menunggu Konfirmasi'
        };


        console.log('Data order yang dikirim:', payload);


        // ----------------------------------------
        // INSERT KE SUPABASE
        // ----------------------------------------

        const { data, error } = await _supabase
            .from('orders')
            .insert([payload])
            .select()
            .single();


        // ----------------------------------------
        // ERROR SUPABASE
        // ----------------------------------------

        if (error) {
            console.error('Supabase Error:', error);

            alert(
                'Gagal menyimpan pesanan.\n\n' +
                error.message
            );

            return;
        }


        // ----------------------------------------
        // HAPUS ITEM YANG SUDAH DIBELI
        // ----------------------------------------

        const hasSelectedProperty = rawCart.some(item =>
            Object.prototype.hasOwnProperty.call(item, 'selected')
        );


        let remainingCart;


        if (hasSelectedProperty) {

            // Jika cart menggunakan selected
            remainingCart = rawCart.filter(item =>
                item.selected === false
            );

        } else {

            // Jika tidak menggunakan selected,
            // semua item dianggap sudah dibeli
            remainingCart = [];

        }


        localStorage.setItem(
            'cart',
            JSON.stringify(remainingCart)
        );


        // ----------------------------------------
        // TAMPILKAN NOTA
        // ----------------------------------------

        tampilkanNota(
            data,
            items,
            total
        );


        // ----------------------------------------
        // RESET FORM
        // ----------------------------------------

        const form =
            document.getElementById('checkoutForm');

        if (form) {
            form.reset();
        }


    } catch (error) {

        console.error(
            'Checkout Error:',
            error
        );

        alert(
            'Terjadi kesalahan saat checkout.\n\n' +
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = 'Bayar Sekarang';
        }

    }
}


// ============================================
// SAAT HALAMAN SELESAI DIMUAT
// ============================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        console.log('Checkout berhasil dimuat.');


        // ----------------------------------------
        // AMBIL CART
        // ----------------------------------------

        const cartData = getCartData();


        console.log(
            'Cart:',
            cartData.rawCart
        );

        console.log(
            'Item checkout:',
            cartData.items
        );

        console.log(
            'Total:',
            cartData.total
        );


        // ----------------------------------------
        // RENDER
        // ----------------------------------------

        renderCheckoutItems(
            cartData.items
        );

        renderTotal(
            cartData.total
        );


        // ----------------------------------------
        // USER
        // ----------------------------------------

        const user = getLocalUser();

        if (user) {

            const namaInput =
                document.getElementById('namaLengkap');

            if (namaInput) {
                namaInput.value =
                    user.nama ??
                    user.name ??
                    user.full_name ??
                    '';
            }
        }


        // ----------------------------------------
        // FORM
        // ----------------------------------------

        const form =
            document.getElementById('checkoutForm');

        if (form) {

            form.addEventListener(
                'submit',
                processCheckout
            );

        } else {

            console.error(
                'Form checkout tidak ditemukan.'
            );

        }

    }
);