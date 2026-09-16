// ==========================================
// SUPABASE CONFIG
// ==========================================

const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';

let _supabase = null;

if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
} else {
    console.error('Supabase SDK belum dimuat.');
}


// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(value) {
    return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ==========================================
// AMBIL CART
// ==========================================

function getCartData() {

    let rawCart = localStorage.getItem('cart');

    console.log('Data cart dari localStorage:', rawCart);

    if (!rawCart) {
        return {
            cart: [],
            selectedItems: [],
            totalPrice: 0
        };
    }

    let cart;

    try {
        cart = JSON.parse(rawCart);
    } catch (error) {
        console.error('Cart bukan JSON valid:', error);

        return {
            cart: [],
            selectedItems: [],
            totalPrice: 0
        };
    }


    // ======================================
    // JIKA CART BERBENTUK { items: [...] }
    // ======================================

    if (!Array.isArray(cart) && Array.isArray(cart.items)) {
        cart = cart.items;
    }


    // ======================================
    // PASTIKAN ARRAY
    // ======================================

    if (!Array.isArray(cart)) {
        cart = [];
    }


    // ======================================
    // PRODUK YANG DIPILIH
    // ======================================

    const selectedItems = cart.filter(item => {

        // Jika selected tidak ada,
        // produk dianggap dipilih

        return item.selected !== false;

    });


    // ======================================
    // HITUNG TOTAL
    // ======================================

    const totalPrice = selectedItems.reduce((total, item) => {

        const price = Number(
            item.price ??
            item.harga ??
            item.harga_produk ??
            0
        );

        const qty = Number(
            item.qty ??
            item.quantity ??
            1
        );

        return total + (price * qty);

    }, 0);


    console.log('Cart:', cart);
    console.log('Selected:', selectedItems);
    console.log('Total:', totalPrice);


    return {
        cart,
        selectedItems,
        totalPrice
    };
}


// ==========================================
// TAMPILKAN PRODUK DI CHECKOUT
// ==========================================

function renderCheckoutItems(items) {

    const container =
        document.getElementById('checkoutItems');

    if (!container) {
        console.warn(
            'Element #checkoutItems tidak ditemukan.'
        );
        return;
    }


    if (!items || items.length === 0) {

        container.innerHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:#64748b;
            ">
                Keranjang kosong.
            </div>
        `;

        return;
    }


    container.innerHTML = items.map(item => {

        const title =
            item.title ||
            item.nama ||
            item.nama_produk ||
            item.product_name ||
            'Produk';


        const price = Number(
            item.price ??
            item.harga ??
            item.harga_produk ??
            0
        );


        const qty = Number(
            item.qty ??
            item.quantity ??
            1
        );


        const subtotal =
            price * qty;


        return `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:12px 0;
                border-bottom:1px solid #e2e8f0;
                gap:15px;
            ">

                <div>

                    <div style="
                        font-weight:bold;
                        color:#0f172a;
                    ">
                        ${escapeHTML(title)}
                    </div>

                    <div style="
                        font-size:13px;
                        color:#64748b;
                        margin-top:4px;
                    ">
                        ${formatRupiah(price)}
                        × ${qty}
                    </div>

                </div>

                <div style="
                    font-weight:bold;
                    color:#0284c7;
                    white-space:nowrap;
                ">
                    ${formatRupiah(subtotal)}
                </div>

            </div>
        `;

    }).join('');
}


// ==========================================
// TAMPILKAN TOTAL
// ==========================================

function renderTotal(total) {

    const totalElement =
        document.getElementById('checkoutTotal');

    if (totalElement) {
        totalElement.innerText =
            formatRupiah(total);
    }

}


// ==========================================
// TAMPILKAN NOTA
// ==========================================

function tampilkanNota(order, items, total) {

    const notaNama =
        document.getElementById('notaNama');

    const notaHp =
        document.getElementById('notaHp');

    const notaAlamat =
        document.getElementById('notaAlamat');

    const notaTotal =
        document.getElementById('notaTotalBayar');

    const notaTanggal =
        document.getElementById('notaTanggal');

    const notaOrderId =
        document.getElementById('notaOrderId');

    const modal =
        document.getElementById('notaModal');


    if (notaNama) {
        notaNama.innerText =
            order.user_name || '-';
    }

    if (notaHp) {
        notaHp.innerText =
            order.nomor_hp || '-';
    }

    if (notaAlamat) {
        notaAlamat.innerText =
            order.alamat || '-';
    }

    if (notaTotal) {
        notaTotal.innerText =
            formatRupiah(total);
    }

    if (notaTanggal) {
        notaTanggal.innerText =
            new Date().toLocaleString('id-ID');
    }

    if (notaOrderId) {
        notaOrderId.innerText =
            'ID PESANAN: #' +
            (order.id || 'BARU');
    }


    // ======================================
    // ITEMS NOTA
    // ======================================

    const itemsContainer =
        document.getElementById('notaItemsList');

    if (itemsContainer) {

        itemsContainer.innerHTML = '';

        items.forEach(item => {

            const title =
                item.title ||
                item.nama ||
                item.nama_produk ||
                'Produk';


            const price = Number(
                item.price ??
                item.harga ??
                item.harga_produk ??
                0
            );


            const qty = Number(
                item.qty ??
                item.quantity ??
                1
            );


            const row =
                document.createElement('div');

            row.className =
                'nota-item-row';

            row.innerHTML = `
                <span>
                    ${escapeHTML(title)}
                    (x${qty})
                </span>

                <span>
                    ${formatRupiah(price * qty)}
                </span>
            `;

            itemsContainer.appendChild(row);

        });
    }


    if (modal) {
        modal.style.display = 'flex';
    }
}


// ==========================================
// TOMBOL SELESAI CHECKOUT
// ==========================================

window.selesaiCheckout = function() {

    window.location.href = 'orders.html';

};


// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {


        // ==================================
        // AMBIL CART
        // ==================================

        const {
            cart,
            selectedItems,
            totalPrice
        } = getCartData();


        console.log(
            'Jumlah cart:',
            cart.length
        );

        console.log(
            'Jumlah produk dipilih:',
            selectedItems.length
        );

        console.log(
            'Total checkout:',
            totalPrice
        );


        // ==================================
        // TAMPILKAN PRODUK
        // ==================================

        renderCheckoutItems(
            selectedItems
        );


        // ==================================
        // TAMPILKAN TOTAL
        // ==================================

        renderTotal(
            totalPrice
        );


        // ==================================
        // USER DARI LOCAL STORAGE
        // ==================================

        const userData =
            localStorage.getItem('user');


        if (userData) {

            try {

                const currentUser =
                    JSON.parse(userData);


                const inputNama =
                    document.getElementById(
                        'namaLengkap'
                    );


                const nama =
                    currentUser.name ||
                    currentUser.user_name ||
                    currentUser.username ||
                    currentUser.email ||
                    '';


                if (
                    inputNama &&
                    nama
                ) {
                    inputNama.value = nama;
                }

            } catch (error) {

                console.error(
                    'Gagal membaca user:',
                    error
                );

            }

        }


        // ==================================
        // FORM CHECKOUT
        // ==================================

        const checkoutForm =
            document.getElementById(
                'checkoutForm'
            );


        const btnBayar =
            document.getElementById(
                'btnBayar'
            );


        async function processCheckout(event) {

            if (event) {
                event.preventDefault();
            }


            // ==============================
            // AMBIL CART TERBARU
            // ==============================

            const {
                cart,
                selectedItems,
                totalPrice
            } = getCartData();


            // ==============================
            // CEK CART
            // ==============================

            if (
                selectedItems.length === 0 ||
                totalPrice <= 0
            ) {

                alert(
                    'Keranjang kosong atau produk belum dipilih!'
                );

                window.location.href =
                    'cart.html';

                return;
            }


            // ==============================
            // INPUT USER
            // ==============================

            const inputNama =
                document.getElementById(
                    'namaLengkap'
                );


            const inputHp =
                document.getElementById(
                    'nomorHp'
                );


            const inputAlamat =
                document.getElementById(
                    'alamatPengiriman'
                );


            const nama =
                inputNama
                    ? inputNama.value.trim()
                    : '';


            const nohp =
                inputHp
                    ? inputHp.value.trim()
                    : '';


            const alamat =
                inputAlamat
                    ? inputAlamat.value.trim()
                    : '';


            if (
                !nama ||
                !nohp ||
                !alamat
            ) {

                alert(
                    'Harap isi nama, nomor HP, dan alamat pengiriman!'
                );

                return;
            }


            // ==============================
            // USER ID
            // ==============================

            let userId = 'GUEST';


            const userSession =
                localStorage.getItem('user');


            if (userSession) {

                try {

                    const parsed =
                        JSON.parse(userSession);


                    userId =
                        parsed.id ||
                        parsed.user_id ||
                        'GUEST';

                } catch (error) {

                    console.error(
                        'User session error:',
                        error
                    );

                }

            }


            // ==============================
            // DISABLE BUTTON
            // ==============================

            if (btnBayar) {

                btnBayar.disabled = true;

                btnBayar.innerText =
                    'Memproses Pesanan...';

            }


            // ==============================
            // PAYLOAD
            // ==============================

            const payload = {

                user_id: String(userId),

                user_name: nama,

                nomor_hp: nohp,

                alamat: alamat,

                total_harga: totalPrice,

                items: selectedItems,

                status: 'Menunggu Konfirmasi'

            };


            console.log(
                'Payload order:',
                payload
            );


            // ==============================
            // SIMPAN SUPABASE
            // ==============================

            let orderData =
                payload;


            if (_supabase) {

                try {

                    const {
                        data,
                        error
                    } = await _supabase
                        .from('orders')
                        .insert([payload])
                        .select()
                        .single();


                    if (error) {

                        console.error(
                            'Supabase Error:',
                            error
                        );

                        alert(
                            'Pesanan gagal disimpan ke database: ' +
                            error.message
                        );


                        if (btnBayar) {

                            btnBayar.disabled =
                                false;

                            btnBayar.innerText =
                                'Konfirmasi & Bayar';

                        }

                        return;

                    }


                    if (data) {

                        orderData =
                            data;

                    }


                    console.log(
                        'Pesanan berhasil disimpan:',
                        orderData
                    );


                } catch (error) {

                    console.error(
                        'Supabase connection error:',
                        error
                    );


                    alert(
                        'Gagal terhubung ke Supabase.'
                    );


                    if (btnBayar) {

                        btnBayar.disabled =
                            false;

                        btnBayar.innerText =
                            'Konfirmasi & Bayar';

                    }

                    return;

                }

            } else {

                alert(
                    'Supabase belum terhubung.'
                );

                if (btnBayar) {

                    btnBayar.disabled =
                        false;

                    btnBayar.innerText =
                        'Konfirmasi & Bayar';

                }

                return;

            }


            // ==============================
            // HAPUS PRODUK YANG DIBELI
            // ==============================

            const remainingCart =
                cart.filter(
                    item => item.selected === false
                );


            localStorage.setItem(
                'cart',
                JSON.stringify(remainingCart)
            );


            // ==============================
            // TAMPILKAN NOTA
            // ==============================

            tampilkanNota(
                orderData,
                selectedItems,
                totalPrice
            );

        }


        // ==================================
        // EVENT FORM
        // ==================================

        if (checkoutForm) {

            checkoutForm.addEventListener(
                'submit',
                processCheckout
            );

        } else if (btnBayar) {

            btnBayar.addEventListener(
                'click',
                processCheckout
            );

        }

    }
);