// ======================================================
// BLUESHOP FASHION - CHECKOUT.JS
// ======================================================

const SUPABASE_URL =
    'https://fbnknnrltrsvydyxgujr.supabase.co';

const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzIiwicmVmIjoiZmJua25ucmx0cnN2eWR5eGd1anIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4ODI0MDQyNiwiZXhwIjoyMTAzODEyNDI2fQ.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o';

const _supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================================
// GLOBAL
// ======================================================

let cart = [];
let selectedItems = [];
let totalPrice = 0;


// ======================================================
// DOM READY
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    const checkoutForm =
        document.getElementById('checkoutForm');

    const btnBayar =
        document.getElementById('btnBayar');


    // ==================================================
    // FORMAT RUPIAH
    // ==================================================

    function formatRupiah(value) {

        return 'Rp ' +
            Number(value || 0).toLocaleString('id-ID');

    }


    // ==================================================
    // AMBIL ID PRODUK
    // ==================================================

    function getProductId(item) {

        return (
            item.id_produk ??
            item.idProduk ??
            item.product_id ??
            item.productId ??
            item.id ??
            null
        );

    }


    // ==================================================
    // NAMA PRODUK
    // ==================================================

    function getProductName(item) {

        return (
            item.nama_produk ??
            item.nama ??
            item.name ??
            item.product_name ??
            item.title ??
            'Produk'
        );

    }


    // ==================================================
    // HARGA PRODUK
    // ==================================================

    function getProductPrice(item) {

        return Number(
            item.harga ??
            item.price ??
            item.harga_produk ??
            item.price_produk ??
            0
        );

    }


    // ==================================================
    // QTY PRODUK
    // ==================================================

    function getProductQty(item) {

        const qty = Number(
            item.qty ??
            item.quantity ??
            item.jumlah ??
            1
        );

        return qty > 0 ? qty : 1;

    }


    // ==================================================
    // LOAD CART
    // ==================================================

    function loadCart() {

        try {

            const savedCart =
                localStorage.getItem('cart');


            if (!savedCart) {

                cart = [];

            } else {

                const parsed =
                    JSON.parse(savedCart);


                if (Array.isArray(parsed)) {

                    cart = parsed;

                } else if (
                    parsed &&
                    Array.isArray(parsed.items)
                ) {

                    cart = parsed.items;

                } else {

                    cart = [];

                }

            }

        } catch (error) {

            console.error(
                'Gagal membaca cart:',
                error
            );

            cart = [];

        }


        // Hanya produk yang dipilih
        selectedItems =
            cart.filter(
                item => item.selected !== false
            );


        // Hitung total
        totalPrice =
            selectedItems.reduce(
                (total, item) => {

                    const harga =
                        getProductPrice(item);

                    const qty =
                        getProductQty(item);

                    return total + (
                        harga * qty
                    );

                },
                0
            );


        // Tampilkan total
        const checkoutTotal =
            document.getElementById(
                'checkoutTotal'
            );


        if (checkoutTotal) {

            checkoutTotal.innerText =
                formatRupiah(totalPrice);

        }


        console.log(
            '=============================='
        );

        console.log(
            'BLUESHOP CHECKOUT'
        );

        console.log(
            'Cart:',
            cart
        );

        console.log(
            'Selected:',
            selectedItems
        );

        console.log(
            'Total:',
            totalPrice
        );

        console.log(
            '=============================='
        );

    }


    // ==================================================
    // AUTOFILL USER
    // ==================================================

    function loadUser() {

        const userData =
            localStorage.getItem('user');


        if (!userData) {
            return;
        }


        try {

            const currentUser =
                JSON.parse(userData);


            const inputNama =
                document.getElementById(
                    'namaLengkap'
                );


            if (
                currentUser.name &&
                inputNama &&
                !inputNama.value
            ) {

                inputNama.value =
                    currentUser.name;

            }

        } catch (error) {

            console.error(
                'Gagal membaca user:',
                error
            );

        }

    }


    // ==================================================
    // CEK STOK PRODUK
    // ==================================================

    async function cekStokProduk(item) {

        const idProduk =
            getProductId(item);

        const qty =
            getProductQty(item);


        // Tidak ada ID produk
        if (!idProduk) {

            throw new Error(
                `Produk "${getProductName(item)}" tidak memiliki id_produk di keranjang.`
            );

        }


        console.log(
            'Cek produk:',
            getProductName(item)
        );

        console.log(
            'ID Produk:',
            idProduk
        );

        console.log(
            'Jumlah:',
            qty
        );


        // Ambil data produk terbaru
        const {
            data: produk,
            error
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


        if (error) {

            console.error(
                'Error SELECT produk:',
                error
            );

            throw new Error(
                `Gagal mengecek produk "${getProductName(item)}": ${error.message}`
            );

        }


        if (!produk) {

            throw new Error(
                `Produk "${getProductName(item)}" dengan ID ${idProduk} tidak ditemukan di Supabase.`
            );

        }


        const stok =
            Number(produk.stok);


        console.log(
            'Produk ditemukan:',
            produk
        );


        // Stok kosong
        if (stok <= 0) {

            throw new Error(
                `Stok "${produk.nama_produk}" sudah habis.`
            );

        }


        // Stok kurang
        if (stok < qty) {

            throw new Error(
                `Stok "${produk.nama_produk}" tidak cukup. Stok tersedia: ${stok}, jumlah dibeli: ${qty}.`
            );

        }


        return {

            id_produk:
                produk.id_produk,

            nama_produk:
                produk.nama_produk,

            stok:
                stok,

            qty:
                qty

        };

    }


    // ==================================================
    // PROSES CHECKOUT
    // ==================================================

    async function prosesCheckout(e) {

        if (e) {

            e.preventDefault();

        }


        // Ambil cart terbaru
        loadCart();


        // ==================================================
        // VALIDASI CART
        // ==================================================

        if (
            !selectedItems ||
            selectedItems.length === 0
        ) {

            alert(
                'Keranjang kosong atau tidak ada produk yang dipilih.'
            );

            window.location.href =
                'cart.html';

            return;

        }


        // ==================================================
        // VALIDASI FORM
        // ==================================================

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


        if (!nama) {

            alert(
                'Nama lengkap wajib diisi.'
            );

            return;

        }


        if (!nohp) {

            alert(
                'Nomor HP wajib diisi.'
            );

            return;

        }


        if (!alamat) {

            alert(
                'Alamat pengiriman wajib diisi.'
            );

            return;

        }


        // ==================================================
        // USER
        // ==================================================

        let currentUser = {

            id: 'GUEST',

            name: nama

        };


        try {

            const userData =
                localStorage.getItem('user');


            if (userData) {

                currentUser =
                    JSON.parse(userData);

            }

        } catch (error) {

            console.error(
                'Gagal membaca user:',
                error
            );

        }


        try {

            // ==================================================
            // LOCK BUTTON
            // ==================================================

            if (btnBayar) {

                btnBayar.disabled =
                    true;

                btnBayar.innerText =
                    'Mengecek stok...';

            }


            // ==================================================
            // VALIDASI ID PRODUK
            // ==================================================

            console.log(
                '===== VALIDASI PRODUK ====='
            );


            for (
                const item of selectedItems
            ) {

                const idProduk =
                    getProductId(item);


                console.log(
                    'Nama:',
                    getProductName(item)
                );

                console.log(
                    'ID:',
                    idProduk
                );

                console.log(
                    'Qty:',
                    getProductQty(item)
                );


                if (!idProduk) {

                    throw new Error(
                        `Produk "${getProductName(item)}" tidak memiliki id_produk. Perbaiki fungsi Add to Cart.`
                    );

                }

            }


            // ==================================================
            // CEK SEMUA STOK
            // ==================================================

            for (
                const item of selectedItems
            ) {

                await cekStokProduk(item);

            }


            // ==================================================
            // BUAT PAYLOAD ORDER
            // ==================================================

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
                    Number(totalPrice),

                // Penting:
                // id_produk dan qty harus ikut tersimpan
                items:
                    selectedItems.map(item => ({

                        ...item,

                        id_produk:
                            Number(
                                getProductId(item)
                            ),

                        qty:
                            Number(
                                getProductQty(item)
                            )

                    })),

                status:
                    'Menunggu Konfirmasi'

            };


            console.log(
                '===== ORDER PAYLOAD ====='
            );

            console.log(
                payload
            );


            // ==================================================
            // INSERT ORDER
            // ==================================================

            const {
                data: orderData,
                error: orderError
            } = await _supabase
                .from('orders')
                .insert([
                    payload
                ])
                .select();


            if (orderError) {

                console.error(
                    'ORDER ERROR:',
                    orderError
                );


                throw new Error(
                    `Pesanan gagal disimpan: ${orderError.message}`
                );

            }


            console.log(
                '✓ ORDER BERHASIL:',
                orderData
            );


            // ==================================================
            // HAPUS ITEM YANG SUDAH DIBELI
            // ==================================================

            const remainingCart =
                cart.filter(
                    item =>
                        item.selected === false
                );


            localStorage.setItem(
                'cart',
                JSON.stringify(
                    remainingCart
                )
            );


            // ==================================================
            // BERHASIL
            // ==================================================

            alert(
                'Pesanan berhasil dibuat!\nStok otomatis dikurangi oleh Supabase.'
            );


            window.location.href =
                'orders.html';


        } catch (error) {

            console.error(
                '================================'
            );

            console.error(
                'CHECKOUT ERROR'
            );

            console.error(
                error
            );

            console.error(
                '================================'
            );


            alert(
                error.message ||
                'Terjadi kesalahan saat checkout.'
            );


            // Aktifkan tombol lagi
            if (btnBayar) {

                btnBayar.disabled =
                    false;

                btnBayar.innerText =
                    'Konfirmasi & Bayar';

            }

        }

    }


    // ==================================================
    // EVENT FORM
    // ==================================================

    if (checkoutForm) {

        checkoutForm.addEventListener(
            'submit',
            prosesCheckout
        );

    }


    // ==================================================
    // EVENT BUTTON
    // ==================================================

    if (
        btnBayar &&
        !checkoutForm
    ) {

        btnBayar.addEventListener(
            'click',
            prosesCheckout
        );

    }


    // ==================================================
    // LOAD AWAL
    // ==================================================

    loadCart();

    loadUser();

});