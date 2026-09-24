```javascript
// ======================================================
// BLUESHOP FASHION - CHECKOUT.JS
// ======================================================

const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzIiwicmVmIjoiZmJua25ucmx0cnN2ydXeGd1anIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4ODI0MDQyNiwiZXhwIjoyMTAzODEyNDI2fQ.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o";

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

let currentOrder = null;
let checkoutProcessing = false;


// ======================================================
// DOM READY
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    const checkoutForm =
        document.getElementById("checkoutForm");

    const btnBayar =
        document.getElementById("btnBayar");


    // ==================================================
    // FORMAT RUPIAH
    // ==================================================

    function formatRupiah(value) {

        const number =
            Number(value) || 0;

        return "Rp " +
            number.toLocaleString("id-ID");
    }


    // ==================================================
    // GET PRODUCT ID
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
    // GET PRODUCT NAME
    // ==================================================

    function getProductName(item) {

        return (
            item.nama_produk ??
            item.nama ??
            item.name ??
            item.product_name ??
            item.title ??
            "Produk"
        );
    }


    // ==================================================
    // GET PRICE
    // ==================================================

    function getProductPrice(item) {

        const price =
            item.harga ??
            item.price ??
            item.harga_produk ??
            item.price_produk ??
            0;

        return Number(price) || 0;
    }


    // ==================================================
    // GET QTY
    // ==================================================

    function getProductQty(item) {

        const qty =
            item.qty ??
            item.quantity ??
            item.jumlah ??
            1;

        const number =
            Number(qty);

        return number > 0 ? number : 1;
    }


    // ==================================================
    // GET SIZE
    // ==================================================

    function getProductSize(item) {

        return (
            item.ukuran ??
            item.size ??
            item.selectedSize ??
            item.selected_size ??
            item.varian_ukuran ??
            "-"
        );
    }


    // ==================================================
    // GET CATEGORY
    // ==================================================

    function getProductCategory(item) {

        return (
            item.kategori ??
            item.category ??
            item.nama_kategori ??
            ""
        );
    }


    // ==================================================
    // GET IMAGE
    // ==================================================

    function getProductImage(item) {

        return (
            item.gambar ??
            item.image ??
            item.foto ??
            ""
        );
    }


    // ==================================================
    // SUBTOTAL
    // ==================================================

    function getSubtotal(item) {

        return (
            getProductPrice(item) *
            getProductQty(item)
        );
    }


    // ==================================================
    // LOAD CART
    // ==================================================

    function loadCart() {

        try {

            const savedCart =
                localStorage.getItem("cart");

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
                "Gagal membaca cart:",
                error
            );

            cart = [];
        }


        selectedItems =
            cart.filter(function (item) {

                return item.selected !== false;

            });


        totalPrice =
            selectedItems.reduce(
                function (total, item) {

                    return (
                        total +
                        getSubtotal(item)
                    );

                },
                0
            );


        updateCheckoutTotal();

        renderCheckoutItems();
    }


    // ==================================================
    // UPDATE TOTAL
    // ==================================================

    function updateCheckoutTotal() {

        const element =
            document.getElementById(
                "checkoutTotal"
            );

        if (element) {

            element.innerText =
                formatRupiah(totalPrice);
        }
    }


    // ==================================================
    // RENDER CHECKOUT ITEMS
    // ==================================================

    function renderCheckoutItems() {

        const container =
            document.getElementById(
                "checkoutItems"
            );

        if (!container) {
            return;
        }


        if (selectedItems.length === 0) {

            container.innerHTML =
                "<p class='text-center text-gray-500 py-6'>" +
                "Tidak ada produk yang dipilih." +
                "</p>";

            return;
        }


        let html = "";


        selectedItems.forEach(function (item) {

            const nama =
                getProductName(item);

            const harga =
                getProductPrice(item);

            const qty =
                getProductQty(item);

            const ukuran =
                getProductSize(item);

            const subtotal =
                getSubtotal(item);

            const gambar =
                getProductImage(item);


            html +=
                '<div class="flex gap-4 border-b border-gray-200 py-4">' +

                    '<div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">';


            if (gambar) {

                html +=
                    '<img src="' +
                    gambar +
                    '" alt="' +
                    nama +
                    '" class="w-full h-full object-cover">';

            } else {

                html +=
                    '<div class="w-full h-full flex items-center justify-center text-gray-400">' +
                    '<i class="fas fa-image"></i>' +
                    '</div>';
            }


            html +=
                    "</div>" +

                    '<div class="flex-1">' +

                        '<h3 class="font-semibold text-gray-800">' +
                        nama +
                        "</h3>" +

                        '<p class="text-sm text-gray-500">' +
                        "Ukuran: " +
                        ukuran +
                        "</p>" +

                        '<p class="text-sm text-gray-500">' +
                        "Jumlah: " +
                        qty +
                        "</p>" +

                        '<p class="text-sm text-gray-500">' +
                        "Harga: " +
                        formatRupiah(harga) +
                        "</p>" +

                    "</div>" +

                    '<div class="font-bold text-blue-600">' +
                    formatRupiah(subtotal) +
                    "</div>" +

                "</div>";
        });


        container.innerHTML = html;
    }


    // ==================================================
    // LOAD USER
    // ==================================================

    function loadUser() {

        const userData =
            localStorage.getItem("user");

        if (!userData) {
            return;
        }


        try {

            const user =
                JSON.parse(userData);

            const nama =
                document.getElementById(
                    "namaLengkap"
                );


            if (
                nama &&
                !nama.value &&
                user.name
            ) {

                nama.value =
                    user.name;
            }

        } catch (error) {

            console.error(
                "Gagal membaca user:",
                error
            );
        }
    }


    // ==================================================
    // FORM DATA
    // ==================================================

    function getFormData() {

        const nama =
            document.getElementById(
                "namaLengkap"
            );

        const hp =
            document.getElementById(
                "nomorHp"
            );

        const alamat =
            document.getElementById(
                "alamatPengiriman"
            );


        return {

            nama:
                nama
                    ? nama.value.trim()
                    : "",

            hp:
                hp
                    ? hp.value.trim()
                    : "",

            alamat:
                alamat
                    ? alamat.value.trim()
                    : ""
        };
    }


    // ==================================================
    // VALIDATE FORM
    // ==================================================

    function validateForm() {

        const data =
            getFormData();


        if (!data.nama) {

            alert(
                "Nama lengkap wajib diisi."
            );

            return false;
        }


        if (!data.hp) {

            alert(
                "Nomor HP wajib diisi."
            );

            return false;
        }


        if (!data.alamat) {

            alert(
                "Alamat pengiriman wajib diisi."
            );

            return false;
        }


        return true;
    }


    // ==================================================
    // RENDER CONFIRMATION
    // ==================================================

    function renderConfirmation() {

        const data =
            getFormData();


        const nama =
            document.getElementById(
                "confirmNama"
            );

        const hp =
            document.getElementById(
                "confirmHp"
            );

        const alamat =
            document.getElementById(
                "confirmAlamat"
            );

        const total =
            document.getElementById(
                "confirmTotal"
            );


        if (nama) {
            nama.innerText =
                data.nama;
        }

        if (hp) {
            hp.innerText =
                data.hp;
        }

        if (alamat) {
            alamat.innerText =
                data.alamat;
        }

        if (total) {
            total.innerText =
                formatRupiah(totalPrice);
        }


        // ----------------------------------------------
        // DETAIL PRODUK
        // ----------------------------------------------

        let container =
            document.getElementById(
                "confirmItems"
            );


        if (!container && total) {

            container =
                document.createElement(
                    "div"
                );

            container.id =
                "confirmItems";

            container.className =
                "mt-4 space-y-3";


            total.parentNode.insertBefore(
                container,
                total
            );
        }


        if (!container) {
            return;
        }


        let html = "";


        selectedItems.forEach(
            function (item) {

                const namaProduk =
                    getProductName(item);

                const harga =
                    getProductPrice(item);

                const qty =
                    getProductQty(item);

                const ukuran =
                    getProductSize(item);

                const subtotal =
                    getSubtotal(item);


                html +=
                    '<div class="border rounded-xl p-4 bg-gray-50">' +

                        '<div class="flex justify-between gap-4">' +

                            '<div>' +

                                '<p class="font-semibold text-gray-800">' +
                                namaProduk +
                                "</p>" +

                                '<p class="text-sm text-gray-500">' +
                                "Ukuran: " +
                                ukuran +
                                "</p>" +

                                '<p class="text-sm text-gray-500">' +
                                "Jumlah: " +
                                qty +
                                "</p>" +

                                '<p class="text-sm text-gray-500">' +
                                "Harga: " +
                                formatRupiah(harga) +
                                "</p>" +

                            "</div>" +

                            '<div class="font-bold text-blue-600">' +
                            formatRupiah(subtotal) +
                            "</div>" +

                        "</div>" +

                    "</div>";
            }
        );


        container.innerHTML =
            html;
    }


    // ==================================================
    // OPEN CONFIRM MODAL
    // ==================================================

    function openConfirmModal() {

        const modal =
            document.getElementById(
                "confirmModal"
            );


        if (!modal) {

            alert(
                "Modal konfirmasi tidak ditemukan."
            );

            return;
        }


        renderConfirmation();


        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );
    }


    // ==================================================
    // CLOSE CONFIRM MODAL
    // ==================================================

    function closeConfirmModal() {

        const modal =
            document.getElementById(
                "confirmModal"
            );


        if (!modal) {
            return;
        }


        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );
    }


    // ==================================================
    // CHECK STOCK
    // ==================================================

    async function checkStock(item) {

        const idProduk =
            getProductId(item);

        const qty =
            getProductQty(item);


        if (!idProduk) {

            throw new Error(
                "Produk " +
                getProductName(item) +
                " tidak memiliki id_produk."
            );
        }


        const result =
            await _supabase
                .from("produk")
                .select(
                    "id_produk,nama_produk,harga,stok"
                )
                .eq(
                    "id_produk",
                    idProduk
                )
                .maybeSingle();


        if (result.error) {

            throw new Error(
                result.error.message
            );
        }


        if (!result.data) {

            throw new Error(
                "Produk " +
                getProductName(item) +
                " tidak ditemukan."
            );
        }


        const stok =
            Number(result.data.stok);


        if (stok <= 0) {

            throw new Error(
                "Stok " +
                result.data.nama_produk +
                " sudah habis."
            );
        }


        if (stok < qty) {

            throw new Error(
                "Stok " +
                result.data.nama_produk +
                " tidak cukup. Tersedia: " +
                stok +
                ", dibutuhkan: " +
                qty
            );
        }


        return result.data;
    }


    // ==================================================
    // CHECK ALL STOCK
    // ==================================================

    async function checkAllStock() {

        for (
            const item of selectedItems
        ) {

            await checkStock(item);
        }
    }


    // ==================================================
    // CURRENT USER
    // ==================================================

    function getCurrentUser() {

        const defaultUser = {

            id: "GUEST",

            name: ""
        };


        try {

            const data =
                localStorage.getItem(
                    "user"
                );


            if (!data) {

                return defaultUser;
            }


            const user =
                JSON.parse(data);


            return user || defaultUser;

        } catch (error) {

            return defaultUser;
        }
    }


    // ==================================================
    // BUILD ORDER ITEMS
    // ==================================================

    function buildOrderItems() {

        return selectedItems.map(
            function (item) {

                return {

                    id_produk:
                        Number(
                            getProductId(item)
                        ),

                    nama_produk:
                        getProductName(item),

                    harga:
                        getProductPrice(item),

                    qty:
                        getProductQty(item),

                    ukuran:
                        getProductSize(item),

                    subtotal:
                        getSubtotal(item),

                    gambar:
                        getProductImage(item)
                };
            }
        );
    }


    // ==================================================
    // SAVE ORDER
    // ==================================================

    async function saveOrder() {

        if (checkoutProcessing) {
            return;
        }


        checkoutProcessing = true;


        const confirmButton =
            document.getElementById(
                "btnConfirmOrder"
            );


        try {

            loadCart();


            if (
                selectedItems.length === 0
            ) {

                throw new Error(
                    "Tidak ada produk yang dipilih."
                );
            }


            if (!validateForm()) {

                checkoutProcessing =
                    false;

                return;
            }


            if (confirmButton) {

                confirmButton.disabled =
                    true;

                confirmButton.innerText =
                    "Mengecek stok...";
            }


            // ------------------------------------------
            // CHECK STOCK
            // ------------------------------------------

            await checkAllStock();


            // ------------------------------------------
            // USER
            // ------------------------------------------

            const user =
                getCurrentUser();


            // ------------------------------------------
            // ORDER ITEMS
            // ------------------------------------------

            const orderItems =
                buildOrderItems();


            // ------------------------------------------
            // PAYLOAD
            // ------------------------------------------

            const payload = {

                user_id:
                    String(
                        user.id ||
                        "GUEST"
                    ),

                user_name:
                    getFormData().nama,

                nomor_hp:
                    getFormData().hp,

                alamat:
                    getFormData().alamat,

                total_harga:
                    Number(totalPrice),

                items:
                    orderItems,

                status:
                    "Menunggu Konfirmasi"
            };


            console.log(
                "ORDER PAYLOAD:",
                payload
            );


            if (confirmButton) {

                confirmButton.innerText =
                    "Menyimpan pesanan...";
            }


            // ------------------------------------------
            // INSERT ORDER
            // ------------------------------------------

            const result =
                await _supabase
                    .from("orders")
                    .insert([payload])
                    .select();


            if (result.error) {

                throw new Error(
                    "Pesanan gagal disimpan: " +
                    result.error.message
                );
            }


            if (
                !result.data ||
                result.data.length === 0
            ) {

                throw new Error(
                    "Data pesanan tidak dikembalikan."
                );
            }


            currentOrder =
                result.data[0];


            console.log(
                "ORDER BERHASIL:",
                currentOrder
            );


            // ------------------------------------------
            // REMOVE PURCHASED CART ITEMS
            // ------------------------------------------

            const purchasedItems =
                new Set(selectedItems);


            cart =
                cart.filter(
                    function (item) {

                        return !purchasedItems.has(
                            item
                        );
                    }
                );


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            // ------------------------------------------
            // SHOW RECEIPT
            // ------------------------------------------

            renderReceipt();


            closeConfirmModal();

            openReceiptModal();


        } catch (error) {

            console.error(
                "CHECKOUT ERROR:",
                error
            );


            alert(
                error.message ||
                "Terjadi kesalahan saat checkout."
            );


        } finally {

            checkoutProcessing =
                false;


            if (confirmButton) {

                confirmButton.disabled =
                    false;

                confirmButton.innerText =
                    "Ya, Sudah Benar";
            }
        }
    }


    // ==================================================
    // RENDER RECEIPT
    // ==================================================

    function renderReceipt() {

        const dateElement =
            document.getElementById(
                "notaTanggal"
            );

        const orderElement =
            document.getElementById(
                "notaOrderId"
            );

        const nameElement =
            document.getElementById(
                "notaNama"
            );

        const hpElement =
            document.getElementById(
                "notaHp"
            );

        const addressElement =
            document.getElementById(
                "notaAlamat"
            );

        const itemsElement =
            document.getElementById(
                "notaItemsList"
            );

        const totalElement =
            document.getElementById(
                "notaTotalBayar"
            );


        // ----------------------------------------------
        // DATE
        // ----------------------------------------------

        if (dateElement) {

            dateElement.innerText =
                new Date().toLocaleString(
                    "id-ID"
                );
        }


        // ----------------------------------------------
        // ORDER ID
        // ----------------------------------------------

        if (orderElement) {

            orderElement.innerText =
                currentOrder.id_order ??
                currentOrder.id ??
                currentOrder.order_id ??
                "-";
        }


        // ----------------------------------------------
        // CUSTOMER
        // ----------------------------------------------

        const data =
            getFormData();


        if (nameElement) {

            nameElement.innerText =
                data.nama;
        }


        if (hpElement) {

            hpElement.innerText =
                data.hp;
        }


        if (addressElement) {

            addressElement.innerText =
                data.alamat;
        }


        // ----------------------------------------------
        // ITEMS
        // ----------------------------------------------

        if (itemsElement) {

            let html = "";


            selectedItems.forEach(
                function (item) {

                    const nama =
                        getProductName(item);

                    const harga =
                        getProductPrice(item);

                    const qty =
                        getProductQty(item);

                    const ukuran =
                        getProductSize(item);

                    const subtotal =
                        getSubtotal(item);


                    html +=
                        '<div class="border-b py-3">' +

                            '<div class="flex justify-between gap-4">' +

                                '<div>' +

                                    '<p class="font-semibold">' +
                                    nama +
                                    "</p>" +

                                    '<p class="text-sm text-gray-500">' +
                                    "Ukuran: " +
                                    ukuran +
                                    " | Jumlah: " +
                                    qty +
                                    "</p>" +

                                    '<p class="text-sm text-gray-500">' +
                                    formatRupiah(harga) +
                                    " / pcs" +
                                    "</p>" +

                                "</div>" +

                                '<div class="font-semibold">' +
                                formatRupiah(subtotal) +
                                "</div>" +

                            "</div>" +

                        "</div>";
                }
            );


            itemsElement.innerHTML =
                html;
        }


        // ----------------------------------------------
        // TOTAL
        // ----------------------------------------------

        if (totalElement) {

            totalElement.innerText =
                formatRupiah(totalPrice);
        }
    }


    // ==================================================
    // OPEN RECEIPT MODAL
    // ==================================================

    function openReceiptModal() {

        const modal =
            document.getElementById(
                "notaModal"
            );


        if (!modal) {

            alert(
                "Pesanan berhasil dibuat."
            );

            window.location.href =
                "orders.html";

            return;
        }


        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );
    }


    // ==================================================
    // CLOSE RECEIPT MODAL
    // ==================================================

    function closeReceiptModal() {

        const modal =
            document.getElementById(
                "notaModal"
            );


        if (!modal) {
            return;
        }


        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );
    }


    // ==================================================
    // GLOBAL FUNCTIONS
    // ==================================================

    window.editCheckout =
        function () {

            closeConfirmModal();

            const input =
                document.getElementById(
                    "namaLengkap"
                );

            if (input) {

                input.focus();
            }
        };


    window.confirmCheckout =
        function () {

            saveOrder();
        };


    window.cetakNota =
        function () {

            window.print();
        };


    window.selesaiCheckout =
        function () {

            closeReceiptModal();

            window.location.href =
                "orders.html";
        };


    // ==================================================
    // FORM SUBMIT
    // ==================================================

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                loadCart();


                if (
                    selectedItems.length === 0
                ) {

                    alert(
                        "Keranjang kosong atau tidak ada produk yang dipilih."
                    );

                    window.location.href =
                        "cart.html";

                    return;
                }


                if (!validateForm()) {
                    return;
                }


                openConfirmModal();
            }
        );
    }


    // ==================================================
    // BUTTON CHECKOUT
    // ==================================================

    if (
        btnBayar &&
        !checkoutForm
    ) {

        btnBayar.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                loadCart();


                if (
                    selectedItems.length === 0
                ) {

                    alert(
                        "Keranjang kosong atau tidak ada produk yang dipilih."
                    );

                    window.location.href =
                        "cart.html";

                    return;
                }


                if (!validateForm()) {
                    return;
                }


                openConfirmModal();
            }
        );
    }


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    loadCart();

    loadUser();


    console.log(
        "BlueShop Checkout berhasil dimuat."
    );

});
```
