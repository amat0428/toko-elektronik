/* =====================================================
   BLUESHOP - CART.JS
   ===================================================== */


/* =====================================================
   SUPABASE
   ===================================================== */

const SUPABASE_URL =
    "https://fbnknnrltrsvydyxgujr.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg4MjQwNDI2LCJleHAiOjIxMDM4MTY0MjZ9.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o";

const _supabase =
    typeof supabase !== "undefined"
        ? supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        )
        : null;


/* =====================================================
   USER
   ===================================================== */

function getCurrentUser() {

    const userData =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("user_session");

    if (!userData) {
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Data user tidak valid:",
            error
        );

        return null;

    }

}


/* =====================================================
   USER KEY
   ===================================================== */

function getUserKey() {

    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        user.username ||
        user.email ||
        user.name ||
        "user"
    )
    .toString()
    .replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
    );

}


/* =====================================================
   CART STORAGE KEY
   ===================================================== */

function getCartStorageKey() {

    const key = getUserKey();

    if (!key) {
        return null;
    }

    return "blueshop_cart_" + key;

}


/* =====================================================
   DATA KERANJANG
   ===================================================== */

let cartData = [];


/* =====================================================
   LOAD CART
   ===================================================== */

function loadCart() {

    const storageKey =
        getCartStorageKey();

    if (!storageKey) {

        cartData = [];

        return;

    }

    try {

        cartData =
            JSON.parse(
                localStorage.getItem(
                    storageKey
                ) || "[]"
            );

        if (!Array.isArray(cartData)) {

            cartData = [];

        }

    } catch (error) {

        console.error(
            "Gagal membaca keranjang:",
            error
        );

        cartData = [];

    }


    /*
     * Pastikan semua item punya selected.
     *
     * Item lama dari toko.html mungkin belum
     * mempunyai selected.
     */

    cartData =
        cartData.map(function (item) {

            return {

                id:
                    item.id,

                name:
                    item.name ||
                    item.title ||
                    "Produk",

                price:
                    Number(
                        item.price || 0
                    ),

                image:
                    item.image || "",

                qty:
                    Math.max(
                        1,
                        Number(
                            item.qty || 1
                        )
                    ),

                selected:
                    item.selected !== false

            };

        });

}


/* =====================================================
   SAVE CART
   ===================================================== */

function saveCart() {

    const storageKey =
        getCartStorageKey();

    if (!storageKey) {
        return;
    }

    localStorage.setItem(
        storageKey,
        JSON.stringify(cartData)
    );

}


/* =====================================================
   FORMAT RUPIAH
   ===================================================== */

function formatRupiah(number) {

    return (
        "Rp " +
        Number(
            number || 0
        ).toLocaleString("id-ID")
    );

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(text) {

    return String(text || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   RENDER CART
   ===================================================== */

function renderCart() {

    const cartList =
        document.getElementById(
            "cartItemsList"
        );

    const cartContent =
        document.getElementById(
            "cartContent"
        );

    const emptyCart =
        document.getElementById(
            "emptyCart"
        );


    if (!cartList) {
        return;
    }


    /* KERANJANG KOSONG */

    if (
        !cartData ||
        cartData.length === 0
    ) {

        if (cartContent) {

            cartContent.classList.add(
                "hidden"
            );

        }

        if (emptyCart) {

            emptyCart.classList.remove(
                "hidden"
            );

        }

        updateSummary();

        return;

    }


    /* ADA PRODUK */

    if (cartContent) {

        cartContent.classList.remove(
            "hidden"
        );

    }

    if (emptyCart) {

        emptyCart.classList.add(
            "hidden"
        );

    }


    cartList.innerHTML =
        cartData.map(
            function (item) {

                const image =
                    item.image ||
                    "https://placehold.co/100x100?text=No+Image";

                const name =
                    item.name ||
                    "Produk";

                const price =
                    Number(
                        item.price || 0
                    );

                const qty =
                    Math.max(
                        1,
                        Number(
                            item.qty || 1
                        )
                    );


                return `

                    <div
                        class="bg-white p-3.5 rounded-lg shadow-sm flex items-center gap-3 border border-gray-100 mb-3"
                    >

                        <!-- CHECKBOX -->

                        <input
                            type="checkbox"
                            ${item.selected ? "checked" : ""}
                            onchange="toggleSelect(${item.id})"
                            class="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0"
                        >


                        <!-- GAMBAR -->

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            class="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-gray-100 shrink-0"
                            onerror="this.src='https://placehold.co/100x100?text=No+Image'"
                        >


                        <!-- DETAIL -->

                        <div
                            class="flex-1 min-w-0"
                        >

                            <p
                                class="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 leading-snug"
                            >
                                ${escapeHTML(name)}
                            </p>

                            <p
                                class="text-blue-600 font-bold text-xs md:text-sm mt-1"
                            >
                                ${formatRupiah(price)}
                            </p>

                            <p
                                class="text-[11px] text-gray-400 mt-1"
                            >
                                Subtotal:
                                ${formatRupiah(price * qty)}
                            </p>

                        </div>


                        <!-- ACTION -->

                        <div
                            class="flex flex-col items-end gap-2 shrink-0"
                        >

                            <!-- HAPUS -->

                            <button
                                onclick="removeItem(${item.id})"
                                class="text-gray-400 hover:text-red-500 text-xs transition"
                                title="Hapus produk"
                            >

                                <i
                                    class="fa-solid fa-trash"
                                ></i>

                            </button>


                            <!-- QUANTITY -->

                            <div
                                class="flex items-center border border-gray-200 rounded overflow-hidden text-xs"
                            >

                                <button
                                    onclick="updateQty(${item.id}, -1)"
                                    class="px-2 py-1 bg-gray-50 hover:bg-gray-200 font-bold text-gray-600"
                                >
                                    -
                                </button>

                                <span
                                    class="px-2.5 py-1 font-semibold text-gray-700"
                                >
                                    ${qty}
                                </span>

                                <button
                                    onclick="updateQty(${item.id}, 1)"
                                    class="px-2 py-1 bg-gray-50 hover:bg-gray-200 font-bold text-gray-600"
                                >
                                    +
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");


    updateSummary();

}


/* =====================================================
   UPDATE QUANTITY
   ===================================================== */

function updateQty(
    id,
    change
) {

    const item =
        cartData.find(
            function (item) {

                return item.id == id;

            }
        );


    if (!item) {
        return;
    }


    item.qty =
        Number(
            item.qty || 1
        ) + Number(change);


    /* Jika quantity 0 → hapus */

    if (item.qty <= 0) {

        cartData =
            cartData.filter(
                function (item) {

                    return item.id != id;

                }
            );

    }


    saveCart();

    renderCart();

}


/* =====================================================
   REMOVE ITEM
   ===================================================== */

function removeItem(id) {

    const item =
        cartData.find(
            function (item) {

                return item.id == id;

            }
        );


    if (!item) {
        return;
    }


    const yakin =
        confirm(
            'Hapus "' +
            (item.name || "produk") +
            '" dari keranjang?'
        );


    if (!yakin) {
        return;
    }


    cartData =
        cartData.filter(
            function (item) {

                return item.id != id;

            }
        );


    saveCart();

    renderCart();

}


/* =====================================================
   SELECT / UNSELECT
   ===================================================== */

function toggleSelect(id) {

    const item =
        cartData.find(
            function (item) {

                return item.id == id;

            }
        );


    if (!item) {
        return;
    }


    item.selected =
        !item.selected;


    saveCart();

    updateSummary();

}


/* =====================================================
   UPDATE SUMMARY
   ===================================================== */

function updateSummary() {

    const selectedItems =
        cartData.filter(
            function (item) {

                return item.selected;

            }
        );


    /* TOTAL HARGA */

    const total =
        selectedItems.reduce(
            function (
                sum,
                item
            ) {

                return (
                    sum +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.qty || 0
                        )
                    )
                );

            },
            0
        );


    /* JUMLAH PRODUK */

    const count =
        selectedItems.reduce(
            function (
                sum,
                item
            ) {

                return (
                    sum +
                    Number(
                        item.qty || 0
                    )
                );

            },
            0
        );


    /* TOTAL ITEM DI KERANJANG */

    const totalItemCount =
        document.getElementById(
            "totalItemCount"
        );


    /* PRODUK TERPILIH */

    const selectedCount =
        document.getElementById(
            "selectedCount"
        );


    /* SUBTOTAL */

    const subtotalPrice =
        document.getElementById(
            "subtotalPrice"
        );


    /* TOTAL */

    const totalPrice =
        document.getElementById(
            "totalPrice"
        );


    if (totalItemCount) {

        totalItemCount.innerText =
            cartData.reduce(
                function (
                    sum,
                    item
                ) {

                    return (
                        sum +
                        Number(
                            item.qty || 0
                        )
                    );

                },
                0
            );

    }


    if (selectedCount) {

        selectedCount.innerText =
            count;

    }


    if (subtotalPrice) {

        subtotalPrice.innerText =
            formatRupiah(total);

    }


    if (totalPrice) {

        totalPrice.innerText =
            formatRupiah(total);

    }


    /* SELECT ALL */

    const selectAllBtn =
        document.getElementById(
            "selectAll"
        );


    if (selectAllBtn) {

        selectAllBtn.checked =
            cartData.length > 0 &&
            cartData.every(
                function (item) {

                    return item.selected;

                }
            );

    }


    /* DISABLE CHECKOUT JIKA BELUM PILIH */

    const checkoutBtn =
        document.getElementById(
            "btnCheckout"
        );


    if (checkoutBtn) {

        if (selectedItems.length === 0) {

            checkoutBtn.disabled = true;

            checkoutBtn.classList.add(
                "opacity-50",
                "cursor-not-allowed"
            );

        } else {

            checkoutBtn.disabled = false;

            checkoutBtn.classList.remove(
                "opacity-50",
                "cursor-not-allowed"
            );

        }

    }

}


/* =====================================================
   CHECK LOGIN
   ===================================================== */

function requireLogin() {

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "Silakan login terlebih dahulu."
        );


        window.location.href =
            "login.html?redirect=" +
            encodeURIComponent(
                "keranjang.html"
            );


        return false;

    }


    return true;

}


/* =====================================================
   CHECKOUT
   ===================================================== */

async function proceedToCheckout() {

    /* CEK LOGIN */

    if (!requireLogin()) {
        return;
    }


    /* AMBIL PRODUK YANG DIPILIH */

    const selectedItems =
        cartData.filter(
            function (item) {

                return item.selected;

            }
        );


    if (
        selectedItems.length === 0
    ) {

        alert(
            "Pilih minimal satu produk untuk di-checkout!"
        );

        return;

    }


    /* HITUNG TOTAL */

    const total =
        selectedItems.reduce(
            function (
                sum,
                item
            ) {

                return (
                    sum +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.qty || 0
                        )
                    )
                );

            },
            0
        );


    /* USER */

    const currentUser =
        getCurrentUser();


    if (!currentUser) {
        return;
    }


    /* DATA CHECKOUT */

    const checkoutData = {

        items:
            selectedItems,

        total:
            total,

        user:
            currentUser,

        createdAt:
            new Date().toISOString()

    };


    /* SIMPAN DATA CHECKOUT */

    localStorage.setItem(
        "checkoutItems",
        JSON.stringify(
            selectedItems
        )
    );


    localStorage.setItem(
        "checkoutData",
        JSON.stringify(
            checkoutData
        )
    );


    /* KE HALAMAN CHECKOUT */

    window.location.href =
        "checkout.html";

}


/* =====================================================
   SELECT ALL
   ===================================================== */

function setupSelectAll() {

    const selectAllBtn =
        document.getElementById(
            "selectAll"
        );


    if (!selectAllBtn) {
        return;
    }


    selectAllBtn.addEventListener(
        "change",
        function (event) {

            const checked =
                event.target.checked;


            cartData =
                cartData.map(
                    function (item) {

                        item.selected =
                            checked;

                        return item;

                    }
                );


            saveCart();

            renderCart();

        }
    );

}


/* =====================================================
   DELETE SELECTED
   ===================================================== */

function setupDeleteSelected() {

    const deleteSelectedBtn =
        document.getElementById(
            "deleteSelected"
        );


    if (!deleteSelectedBtn) {
        return;
    }


    deleteSelectedBtn.addEventListener(
        "click",
        function () {

            const selectedItems =
                cartData.filter(
                    function (item) {

                        return item.selected;

                    }
                );


            if (
                selectedItems.length === 0
            ) {

                alert(
                    "Pilih produk yang ingin dihapus terlebih dahulu."
                );

                return;

            }


            const yakin =
                confirm(
                    "Yakin ingin menghapus " +
                    selectedItems.length +
                    " produk terpilih?"
                );


            if (!yakin) {
                return;
            }


            cartData =
                cartData.filter(
                    function (item) {

                        return !item.selected;

                    }
                );


            saveCart();

            renderCart();

        }
    );

}


/* =====================================================
   INITIALIZE
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🛒 BlueShop Cart starting..."
        );


        /* CEK LOGIN */

        if (!requireLogin()) {
            return;
        }


        /* LOAD CART */

        loadCart();


        /* RENDER */

        renderCart();


        /* SELECT ALL */

        setupSelectAll();


        /* DELETE SELECTED */

        setupDeleteSelected();


        /* CHECKOUT */

        const checkoutBtn =
            document.getElementById(
                "btnCheckout"
            );


        if (checkoutBtn) {

            checkoutBtn.addEventListener(
                "click",
                proceedToCheckout
            );

        }


        console.log(
            "✅ Cart loaded:",
            cartData
        );

    }
);