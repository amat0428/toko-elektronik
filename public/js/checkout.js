// ============================================
// CHECKOUT TOKO ELEKTRONIK
// ============================================

// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
    'https://fbnknnrltrsvydyxgujr.supabase.co';

const SUPABASE_KEY =
    'sb_publishable_JStXk700ejTvHYnjAHlCYA_1tf1Kccp';

const _supabase =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================
// FORMAT RUPIAH
// ============================================

function formatRupiah(value) {

    return 'Rp ' +
        Number(value || 0)
            .toLocaleString('id-ID');

}


// ============================================
// PARSE HARGA
// ============================================

function parsePrice(value) {

    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {

        const clean = value
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
// BACA CART
// ============================================

function getRawCart() {

    try {

        // UTAMA:
        // toko.html menggunakan blueshop_cart
        let raw =
            localStorage.getItem('blueshop_cart');

        // Cadangan jika ada kode lama
        if (!raw) {
            raw =
                localStorage.getItem('cart');
        }

        console.log(
            'Data localStorage cart:',
            raw
        );

        if (!raw) {
            return [];
        }

        const parsed =
            JSON.parse(raw);


        if (Array.isArray(parsed)) {
            return parsed;
        }


        if (
            parsed &&
            Array.isArray(parsed.items)
        ) {
            return parsed.items;
        }


        return [];

    } catch (error) {

        console.error(
            'Gagal membaca cart:',
            error
        );

        return [];

    }

}


// ============================================
// AMBIL NAMA
// ============================================

function getItemName(item) {

    const product =
        item.product || {};


    return (
        item.name ??
        item.nama ??
        item.nama_produk ??
        item.product_name ??
        item.title ??
        product.name ??
        product.nama ??
        product.nama_produk ??
        product.product_name ??
        product.title ??
        'Produk'
    );

}


// ============================================
// AMBIL HARGA
// ============================================

function getItemPrice(item) {

    const product =
        item.product || {};


    const price =
        item.price ??
        item.harga ??
        item.harga_produk ??
        item.product_price ??
        item.selling_price ??
        product.price ??
        product.harga ??
        product.harga_produk ??
        0;


    return parsePrice(price);

}


// ============================================
// AMBIL QTY
// ============================================

function getItemQty(item) {

    const product =
        item.product || {};


    const qty =
        item.qty ??
        item.quantity ??
        item.jumlah ??
        item.kuantitas ??
        product.qty ??
        product.quantity ??
        1;


    const result =
        Number(qty);


    return result > 0
        ? result
        : 1;

}


// ============================================
// DATA CHECKOUT
// ============================================

function getCartData() {

    const cart =
        getRawCart();


    console.log(
        'Cart asli:',
        cart
    );


    // Ambil produk yang dipilih
    const selectedItems =
        cart.filter(item => {

            // Kalau tidak punya selected,
            // anggap dipilih
            if (
                !Object.prototype.hasOwnProperty.call(
                    item,
                    'selected'
                )
            ) {
                return true;
            }

            return item.selected !== false;

        });


    const items =
        selectedItems.map(item => {

            const name =
                getItemName(item);

            const price =
                getItemPrice(item);

            const qty =
                getItemQty(item);


            return {

                ...item,

                name: name,

                title: name,

                price: price,

                qty: qty,

                subtotal:
                    price * qty

            };

        });


    const total =
        items.reduce(
            (sum, item) =>
                sum + item.subtotal,
            0
        );


    console.log(
        'Item checkout:',
        items
    );

    console.log(
        'Total checkout:',
        total
    );


    return {

        items: items,

        total: total,

        rawCart: cart

    };

}


// ============================================
// TAMPILKAN ITEM
// ============================================

function renderCheckoutItems(items) {

    const container =
        document.getElementById(
            'checkoutItems'
        );


    if (!container) {
        return;
    }


    if (
        !items ||
        items.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-checkout">
                Keranjang belanja kosong.
            </div>
        `;

        return;

    }


    container.innerHTML =
        items.map(item => {

            return `

                <div class="checkout-item">

                    <div class="checkout-item-info">

                        <div class="checkout-item-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="checkout-item-detail">
                            ${formatRupiah(item.price)}
                            ×
                            ${item.qty}
                        </div>

                    </div>


                    <div class="checkout-item-subtotal">

                        ${formatRupiah(
                            item.subtotal
                        )}

                    </div>

                </div>

            `;

        }).join('');

}


// ============================================
// TAMPILKAN TOTAL
// ============================================

function renderTotal(total) {

    const element =
        document.getElementById(
            'checkoutTotal'
        );


    if (element) {

        element.textContent =
            formatRupiah(total);

    }

}


// ============================================
// USER LOCAL STORAGE
// ============================================

function getLocalUser() {

    try {

        const raw =
            localStorage.getItem('user');


        if (!raw) {
            return null;
        }


        return JSON.parse(raw);

    } catch (error) {

        console.error(
            'Error user:',
            error
        );

        return null;

    }

}


// ============================================
// TAMPILKAN NOTA
// ============================================

function tampilkanNota(
    order,
    items,
    total
) {

    const nama =
        document.getElementById(
            'namaLengkap'
        )?.value || '';


    const hp =
        document.getElementById(
            'nomorHp'
        )?.value || '';


    const alamat =
        document.getElementById(
            'alamatPengiriman'
        )?.value || '';


    const notaNama =
        document.getElementById(
            'notaNama'
        );


    const notaHp =
        document.getElementById(
            'notaHp'
        );


    const notaAlamat =
        document.getElementById(
            'notaAlamat'
        );


    const notaTotalBayar =
        document.getElementById(
            'notaTotalBayar'
        );


    const notaTanggal =
        document.getElementById(
            'notaTanggal'
        );


    const notaOrderId =
        document.getElementById(
            'notaOrderId'
        );


    const notaItemsList =
        document.getElementById(
            'notaItemsList'
        );


    const notaModal =
        document.getElementById(
            'notaModal'
        );


    if (notaNama) {
        notaNama.textContent =
            nama;
    }


    if (notaHp) {
        notaHp.textContent =
            hp;
    }


    if (notaAlamat) {
        notaAlamat.textContent =
            alamat;
    }


    if (notaTotalBayar) {
        notaTotalBayar.textContent =
            formatRupiah(total);
    }


    if (notaTanggal) {
        notaTanggal.textContent =
            new Date().toLocaleString(
                'id-ID'
            );
    }


    if (notaOrderId) {
        notaOrderId.textContent =
            order?.id || '-';
    }


    if (notaItemsList) {

        notaItemsList.innerHTML =
            items.map(item => {

                return `

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        padding:8px 0;
                        border-bottom:1px solid #eee;
                    ">

                        <span>
                            ${escapeHTML(item.name)}
                            ×
                            ${item.qty}
                        </span>

                        <strong>
                            ${formatRupiah(
                                item.subtotal
                            )}
                        </strong>

                    </div>

                `;

            }).join('');

    }


    if (notaModal) {

        notaModal.style.display =
            'flex';

    }

}


// ============================================
// CETAK NOTA
// ============================================

window.cetakNota = function () {

    window.print();

};


// ============================================
// LIHAT PESANAN
// ============================================

window.selesaiCheckout = function () {

    window.location.href =
        'orders.html';

};


// ============================================
// PROSES CHECKOUT
// ============================================

async function processCheckout(event) {

    event.preventDefault();


    const button =
        document.getElementById(
            'btnBayar'
        );


    try {

        // ================================
        // AMBIL CART
        // ================================

        const cartData =
            getCartData();


        const items =
            cartData.items;


        const total =
            cartData.total;


        const rawCart =
            cartData.rawCart;


        // ================================
        // VALIDASI CART
        // ================================

        if (!items.length) {

            alert(
                'Keranjang belanja masih kosong.'
            );

            return;

        }


        if (total <= 0) {

            alert(
                'Total belanja tidak valid.'
            );

            console.error(
                'Cart:',
                rawCart
            );

            return;

        }


        // ================================
        // FORM
        // ================================

        const nama =
            document.getElementById(
                'namaLengkap'
            )?.value.trim();


        const nomorHp =
            document.getElementById(
                'nomorHp'
            )?.value.trim();


        const alamat =
            document.getElementById(
                'alamatPengiriman'
            )?.value.trim();


        if (!nama) {

            alert(
                'Nama lengkap wajib diisi.'
            );

            return;

        }


        if (!nomorHp) {

            alert(
                'Nomor HP / WhatsApp wajib diisi.'
            );

            return;

        }


        if (!alamat) {

            alert(
                'Alamat pengiriman wajib diisi.'
            );

            return;

        }


        // ================================
        // USER
        // ================================

        const user =
            getLocalUser();


        let userId = null;


        if (user) {

            userId =
                user.id ??
                user.user_id ??
                user.uid ??
                null;

        }


        // ================================
        // BUTTON
        // ================================

        if (button) {

            button.disabled =
                true;

            button.textContent =
                'Memproses...';

        }


        // ================================
        // PAYLOAD
        // ================================

        const payload = {

            user_id:
                userId,

            user_name:
                nama,

            nomor_hp:
                nomorHp,

            alamat:
                alamat,

            total_harga:
                total,

            items:
                items,

            status:
                'Menunggu Konfirmasi'

        };


        console.log(
            'Mengirim order:',
            payload
        );


        // ================================
        // INSERT SUPABASE
        // ================================

        const {
            data,
            error
        } = await _supabase

            .from('orders')

            .insert([
                payload
            ])

            .select()

            .single();


        // ================================
        // ERROR
        // ================================

        if (error) {

            console.error(
                'Supabase Error:',
                error
            );


            alert(
                'Gagal menyimpan pesanan:\n\n' +
                error.message
            );


            return;

        }


        console.log(
            'Order berhasil:',
            data
        );


        // ================================
        // HAPUS ITEM YANG DIBELI
        // ================================

        const hasSelected =
            rawCart.some(item =>
                Object.prototype.hasOwnProperty.call(
                    item,
                    'selected'
                )
            );


        let remainingCart;


        if (hasSelected) {

            remainingCart =
                rawCart.filter(
                    item =>
                        item.selected === false
                );

        } else {

            remainingCart = [];

        }


        localStorage.setItem(
            'blueshop_cart',
            JSON.stringify(
                remainingCart
            )
        );


        // ================================
        // NOTA
        // ================================

        tampilkanNota(
            data,
            items,
            total
        );


    } catch (error) {

        console.error(
            'Checkout Error:',
            error
        );


        alert(
            'Terjadi kesalahan:\n\n' +
            error.message
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                'Bayar Sekarang';

        }

    }

}


// ============================================
// SAAT HALAMAN DIBUKA
// ============================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        console.log(
            'Checkout berhasil dimuat.'
        );


        // ================================
        // BACA CART
        // ================================

        const cartData =
            getCartData();


        // ================================
        // TAMPILKAN PRODUK
        // ================================

        renderCheckoutItems(
            cartData.items
        );


        // ================================
        // TAMPILKAN TOTAL
        // ================================

        renderTotal(
            cartData.total
        );


        // ================================
        // USER
        // ================================

        const user =
            getLocalUser();


        if (user) {

            const namaInput =
                document.getElementById(
                    'namaLengkap'
                );


            if (namaInput) {

                namaInput.value =
                    user.nama ??
                    user.name ??
                    user.full_name ??
                    '';

            }

        }


        // ================================
        // FORM
        // ================================

        const form =
            document.getElementById(
                'checkoutForm'
            );


        if (form) {

            form.addEventListener(
                'submit',
                processCheckout
            );

        }

    }
);