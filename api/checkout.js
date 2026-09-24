const SUPABASE_URL = 'https://fbnknnrltrsvydyxgujr.supabase.co';

const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxMjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';

const _supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.addEventListener('DOMContentLoaded', () => {

    let cart = [];
    let selectedItems = [];
    let totalPrice = 0;

    const checkoutForm = document.getElementById('checkoutForm');
    const btnBayar = document.getElementById('btnBayar');

    // ==========================================
    // AMBIL KERANJANG
    // ==========================================

    function loadCart() {

        try {

            const data = JSON.parse(
                localStorage.getItem('cart')
            );

            if (Array.isArray(data)) {
                cart = data;
            } else if (data && Array.isArray(data.items)) {
                cart = data.items;
            } else {
                cart = [];
            }

        } catch (error) {

            console.error('Gagal membaca cart:', error);
            cart = [];

        }

        selectedItems = cart.filter(
            item => item.selected !== false
        );

        totalPrice = selectedItems.reduce(
            (sum, item) => {

                const harga = Number(
                    item.price ??
                    item.harga ??
                    item.harga_produk ??
                    0
                );

                const qty = Number(
                    item.qty ??
                    item.quantity ??
                    item.jumlah ??
                    1
                );

                return sum + (harga * qty);

            },
            0
        );

        const checkoutTotalEl =
            document.getElementById('checkoutTotal');

        if (checkoutTotalEl) {

            checkoutTotalEl.innerText =
                'Rp ' +
                totalPrice.toLocaleString('id-ID');

        }

        console.log('Cart:', cart);
        console.log('Selected Items:', selectedItems);
        console.log('Total:', totalPrice);
    }


    // ==========================================
    // AUTOFILL USER
    // ==========================================

    const userData = localStorage.getItem('user');

    if (userData) {

        try {

            const currentUser = JSON.parse(userData);

            const inputNama =
                document.getElementById('namaLengkap');

            if (
                currentUser.name &&
                inputNama &&
                !inputNama.value
            ) {

                inputNama.value = currentUser.name;

            }

        } catch (error) {

            console.error(
                'Error membaca data user:',
                error
            );

        }

    }


    // ==========================================
    // PROSES CHECKOUT
    // ==========================================

    async function prosesCheckout(e) {

        if (e) {
            e.preventDefault();
        }

        // Ambil cart terbaru
        loadCart();

        // ==========================================
        // VALIDASI KERANJANG
        // ==========================================

        if (selectedItems.length === 0) {

            alert(
                'Keranjang Anda kosong atau tidak ada item yang dipilih!'
            );

            window.location.href = 'cart.html';

            return;
        }


        // ==========================================
        // AMBIL FORM
        // ==========================================

        const inputNama =
            document.getElementById('namaLengkap');

        const inputHp =
            document.getElementById('nomorHp');

        const inputAlamat =
            document.getElementById('alamatPengiriman');

        const nama =
            inputNama ?
            inputNama.value.trim() :
            '';

        const nohp =
            inputHp ?
            inputHp.value.trim() :
            '';

        const alamat =
            inputAlamat ?
            inputAlamat.value.trim() :
            '';


        if (!nama || !nohp || !alamat) {

            alert(
                'Harap isi semua kolom form!'
            );

            return;
        }


        // ==========================================
        // USER
        // ==========================================

        let currentUser = {
            id: 'GUEST',
            name: nama
        };

        try {

            const dataUser =
                localStorage.getItem('user');

            if (dataUser) {

                currentUser =
                    JSON.parse(dataUser);

            }

        } catch (error) {

            console.error(
                'Gagal membaca user:',
                error
            );

        }


        try {

            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            if (btnBayar) {

                btnBayar.disabled = true;

                btnBayar.innerText =
                    'Mengecek stok...';

            }


            // ==========================================
            // CEK SETIAP PRODUK
            // ==========================================

            for (const item of selectedItems) {

                /*
                 * Cari ID produk
                 *
                 * Pastikan cart menyimpan:
                 * id_produk
                 */

                const idProduk =
                    item.id_produk ??
                    item.id ??
                    item.product_id;

                const qty =
                    Number(
                        item.qty ??
                        item.quantity ??
                        item.jumlah ??
                        1
                    );


                if (!idProduk) {

                    throw new Error(
                        `Produk "${item.nama_produk || item.nama || item.name || 'Tidak diketahui'}" tidak memiliki id_produk di cart.`
                    );

                }


                if (qty <= 0) {

                    throw new Error(
                        'Jumlah produk tidak valid.'
                    );

                }


                console.log(
                    'Cek stok:',
                    idProduk,
                    'jumlah:',
                    qty
                );


                // ==========================================
                // AMBIL STOK TERBARU
                // ==========================================

                const {
                    data: produk,
                    error: produkError
                } = await _supabase
                    .from('produk')
                    .select(
                        'id_produk,nama_produk,harga,stok'
                    )
                    .eq(
                        'id_produk',
                        idProduk
                    )
                    .maybeSingle();


                if (produkError) {

                    console.error(
                        'Error mengambil produk:',
                        produkError
                    );

                    throw new Error(
                        'Gagal mengecek stok produk.'
                    );

                }


                if (!produk) {

                    throw new Error(
                        `Produk dengan ID ${idProduk} tidak ditemukan.`
                    );

                }


                const stokSekarang =
                    Number(produk.stok);


                console.log(
                    `Produk ${produk.nama_produk}: stok ${stokSekarang}, diminta ${qty}`
                );


                // ==========================================
                // STOK TIDAK CUKUP
                // ==========================================

                if (stokSekarang < qty) {

                    throw new Error(
                        `Stok "${produk.nama_produk}" tidak cukup. Tersedia ${stokSekarang}, tetapi kamu membeli ${qty}.`
                    );

                }

            }


            // ==========================================
            // KURANGI STOK
            // ==========================================

            if (btnBayar) {

                btnBayar.innerText =
                    'Mengurangi stok...';

            }


            for (const item of selectedItems) {

                const idProduk =
                    item.id_produk ??
                    item.id ??
                    item.product_id;

                const qty =
                    Number(
                        item.qty ??
                        item.quantity ??
                        item.jumlah ??
                        1
                    );


                console.log(
                    'Mengurangi stok:',
                    idProduk,
                    qty
                );


                const {
                    data: stokBerhasil,
                    error: stokError
                } = await _supabase.rpc(
                    'kurangi_stok_produk',
                    {
                        p_id_produk: Number(idProduk),
                        p_jumlah: qty
                    }
                );


                if (stokError) {

                    console.error(
                        'RPC stok error:',
                        stokError
                    );

                    throw new Error(
                        'Gagal mengurangi stok: ' +
                        stokError.message
                    );

                }


                if (stokBerhasil !== true) {

                    throw new Error(
                        `Stok produk tidak cukup untuk produk ID ${idProduk}.`
                    );

                }

            }


            // ==========================================
            // SIMPAN ORDER
            // ==========================================

            if (btnBayar) {

                btnBayar.innerText =
                    'Menyimpan pesanan...';

            }


            const payload = {

                user_id:
                    String(
                        currentUser.id ||
                        'GUEST'
                    ),

                user_name:
                    nama,

                nomor_hp:
                    nohp,

                alamat:
                    alamat,

                total_harga:
                    totalPrice,

                items:
                    selectedItems,

                status:
                    'Menunggu Konfirmasi'

            };


            console.log(
                'Order payload:',
                payload
            );


            const {
                data,
                error
            } = await _supabase
                .from('orders')
                .insert([payload])
                .select();


            if (error) {

                console.error(
                    'Supabase Order Error:',
                    error
                );

                throw error;

            }


            console.log(
                'Order berhasil:',
                data
            );


            // ==========================================
            // HAPUS PRODUK YANG SUDAH DIBELI
            // ==========================================

            const remainingCart =
                cart.filter(
                    item => item.selected === false
                );


            localStorage.setItem(
                'cart',
                JSON.stringify(
                    remainingCart
                )
            );


            // ==========================================
            // SELESAI
            // ==========================================

            alert(
                'Pesanan berhasil dibuat dan stok berhasil dikurangi!'
            );


            window.location.href =
                'orders.html';


        } catch (err) {

            console.error(
                'CHECKOUT ERROR:',
                err
            );


            alert(
                'Gagal memproses pesanan:\n\n' +
                (
                    err.message ||
                    'Terjadi kesalahan.'
                )
            );


            if (btnBayar) {

                btnBayar.disabled = false;

                btnBayar.innerText =
                    'Konfirmasi & Bayar';

            }

        }

    }


    // ==========================================
    // EVENT CHECKOUT
    // ==========================================

    if (checkoutForm) {

        checkoutForm.addEventListener(
            'submit',
            prosesCheckout
        );

    } else if (btnBayar) {

        btnBayar.addEventListener(
            'click',
            prosesCheckout
        );

    }


    // ==========================================
    // LOAD AWAL
    // ==========================================

    loadCart();

});