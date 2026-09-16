// ============================================
// CHECKOUT TOKO ELEKTRONIK
// ============================================

// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o";

const _supabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ============================================
// CART KEY
// ============================================

const CART_KEYS = [
    "blueshop_cart",
    "cart",
    "shopping_cart"
];

// ============================================
// FORMAT RUPIAH
// ============================================

function formatRupiah(value) {
    const number = Number(value) || 0;

    return "Rp " + number.toLocaleString("id-ID");
}

// ============================================
// PARSE HARGA
// ============================================

function parsePrice(value) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        let clean = value
            .replace(/Rp/gi, "")
            .replace(/\s/g, "")
            .trim();

        // Format Indonesia:
        // 50.000
        // 1.500.000
        if (clean.includes(".")) {
            clean = clean.replace(/\./g, "");
        }

        // Format desimal jika masih ada koma
        clean = clean.replace(/,/g, "");

        return Number(clean) || 0;
    }

    return 0;
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================
// BACA CART
// ============================================

function getRawCart() {
    console.log("================================");
    console.log("🔎 MENCARI DATA CART");
    console.log("================================");

    for (const key of CART_KEYS) {
        try {
            const raw = localStorage.getItem(key);

            console.log(
                `📦 localStorage["${key}"]:`,
                raw
            );

            if (!raw) {
                continue;
            }

            const parsed = JSON.parse(raw);

            // Format:
            // [{...}, {...}]
            if (Array.isArray(parsed)) {
                console.log(
                    `✅ CART DITEMUKAN DI "${key}"`,
                    parsed
                );

                return parsed;
            }

            // Format:
            // { items: [...] }
            if (
                parsed &&
                Array.isArray(parsed.items)
            ) {
                console.log(
                    `✅ CART ITEMS DITEMUKAN DI "${key}"`,
                    parsed.items
                );

                return parsed.items;
            }

        } catch (error) {
            console.error(
                `❌ Error membaca ${key}:`,
                error
            );
        }
    }

    console.warn("⚠️ Tidak ada cart yang ditemukan.");

    return [];
}

// ============================================
// NORMALISASI ITEM
// ============================================

function normalizeCartItem(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

    const product = item.product || {};

    const name =
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
        "Produk";

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

    const qty =
        item.qty ??
        item.quantity ??
        item.jumlah ??
        item.kuantitas ??
        product.qty ??
        product.quantity ??
        1;

    const parsedPrice = parsePrice(price);

    const parsedQty = Number(qty);

    const finalQty =
        parsedQty > 0
            ? parsedQty
            : 1;

    return {
        ...item,

        id:
            item.id ??
            item.id_produk ??
            product.id ??
            product.id_produk ??
            null,

        name: String(name),

        title: String(name),

        price: parsedPrice,

        qty: finalQty,

        subtotal:
            parsedPrice * finalQty
    };
}

// ============================================
// DATA CHECKOUT
// ============================================

function getCartData() {
    const rawCart = getRawCart();

    console.log("🛒 RAW CART:", rawCart);

    if (!Array.isArray(rawCart)) {
        return {
            items: [],
            total: 0,
            rawCart: []
        };
    }

    const items = rawCart
        .map(normalizeCartItem)
        .filter(item => item !== null);

    const total = items.reduce(
        (sum, item) => {
            return sum + item.subtotal;
        },
        0
    );

    console.log("================================");
    console.log("📦 ITEM CHECKOUT:", items);
    console.log("💰 TOTAL CHECKOUT:", total);
    console.log("================================");

    return {
        items,
        total,
        rawCart
    };
}

// ============================================
// TAMPILKAN ITEM
// ============================================

function renderCheckoutItems(items) {
    const container =
        document.getElementById("checkoutItems");

    if (!container) {
        console.warn(
            "⚠️ Element #checkoutItems tidak ditemukan."
        );

        return;
    }

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-checkout">
                Keranjang belanja kosong.
            </div>
        `;

        return;
    }

    container.innerHTML = items
        .map(item => {
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
                        ${formatRupiah(item.subtotal)}
                    </div>

                </div>
            `;
        })
        .join("");
}

// ============================================
// TAMPILKAN TOTAL
// ============================================

function renderTotal(total) {
    const elements = [
        "checkoutTotal",
        "totalPrice",
        "totalBelanja",
        "grandTotal"
    ];

    elements.forEach(id => {
        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                formatRupiah(total);
        }
    });
}

// ============================================
// USER
// ============================================

function getLocalUser() {
    const keys = [
        "user",
        "currentUser",
        "user_session"
    ];

    for (const key of keys) {
        try {
            const raw =
                localStorage.getItem(key);

            if (!raw) {
                continue;
            }

            const user =
                JSON.parse(raw);

            if (user) {
                console.log(
                    "👤 User ditemukan:",
                    key,
                    user
                );

                return user;
            }

        } catch (error) {
            console.warn(
                `⚠️ User ${key} tidak valid.`,
                error
            );
        }
    }

    return null;
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
            "namaLengkap"
        )?.value || "";

    const hp =
        document.getElementById(
            "nomorHp"
        )?.value || "";

    const alamat =
        document.getElementById(
            "alamatPengiriman"
        )?.value || "";

    const notaNama =
        document.getElementById(
            "notaNama"
        );

    const notaHp =
        document.getElementById(
            "notaHp"
        );

    const notaAlamat =
        document.getElementById(
            "notaAlamat"
        );

    const notaTotalBayar =
        document.getElementById(
            "notaTotalBayar"
        );

    const notaTanggal =
        document.getElementById(
            "notaTanggal"
        );

    const notaOrderId =
        document.getElementById(
            "notaOrderId"
        );

    const notaItemsList =
        document.getElementById(
            "notaItemsList"
        );

    const notaModal =
        document.getElementById(
            "notaModal"
        );

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
        notaTotalBayar.textContent =
            formatRupiah(total);
    }

    if (notaTanggal) {
        notaTanggal.textContent =
            new Date().toLocaleString(
                "id-ID"
            );
    }

    if (notaOrderId) {
        notaOrderId.textContent =
            order?.id || "-";
    }

    if (notaItemsList) {
        notaItemsList.innerHTML =
            items
                .map(item => {
                    return `
                        <div style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            padding:8px 0;
                            border-bottom:1px solid #eee;
                        ">

                            <span>
                                ${escapeHTML(item.name)}
                                × ${item.qty}
                            </span>

                            <strong>
                                ${formatRupiah(
                                    item.subtotal
                                )}
                            </strong>

                        </div>
                    `;
                })
                .join("");
    }

    if (notaModal) {
        notaModal.style.display = "flex";
    }
}

// ============================================
// CETAK NOTA
// ============================================

window.cetakNota = function () {
    window.print();
};

// ============================================
// SELESAI CHECKOUT
// ============================================

window.selesaiCheckout = function () {
    window.location.href = "orders.html";
};

// ============================================
// PROSES CHECKOUT
// ============================================

async function processCheckout(event) {
    event.preventDefault();

    const button =
        document.getElementById(
            "btnBayar"
        );

    try {

        console.log(
            "================================"
        );

        console.log(
            "💳 MULAI PROSES CHECKOUT"
        );

        console.log(
            "================================"
        );

        // ====================================
        // AMBIL CART
        // ====================================

        const cartData =
            getCartData();

        const items =
            cartData.items;

        const total =
            cartData.total;

        const rawCart =
            cartData.rawCart;

        // ====================================
        // VALIDASI CART
        // ====================================

        if (
            !items ||
            items.length === 0
        ) {
            alert(
                "Keranjang belanja masih kosong."
            );

            console.error(
                "❌ Tidak ada item checkout.",
                rawCart
            );

            return;
        }

        if (total <= 0) {
            alert(
                "Total belanja tidak valid."
            );

            console.error(
                "❌ Total:",
                total
            );

            return;
        }

        // ====================================
        // FORM
        // ====================================

        const nama =
            document.getElementById(
                "namaLengkap"
            )?.value.trim() || "";

        const nomorHp =
            document.getElementById(
                "nomorHp"
            )?.value.trim() || "";

        const alamat =
            document.getElementById(
                "alamatPengiriman"
            )?.value.trim() || "";

        if (!nama) {
            alert(
                "Nama lengkap wajib diisi."
            );

            return;
        }

        if (!nomorHp) {
            alert(
                "Nomor HP / WhatsApp wajib diisi."
            );

            return;
        }

        if (!alamat) {
            alert(
                "Alamat pengiriman wajib diisi."
            );

            return;
        }

        // ====================================
        // USER
        // ====================================

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

        // ====================================
        // BUTTON
        // ====================================

        if (button) {
            button.disabled = true;
            button.textContent =
                "Memproses...";
        }

        // ====================================
        // PAYLOAD
        // ====================================

        const payload = {
            user_id: userId,

            user_name: nama,

            nomor_hp: nomorHp,

            alamat: alamat,

            total_harga: total,

            items: items,

            status:
                "Menunggu Konfirmasi"
        };

        console.log(
            "📤 PAYLOAD ORDER:",
            payload
        );

        // ====================================
        // SUPABASE
        // ====================================

        const {
            data,
            error
        } = await _supabase
            .from("orders")
            .insert([payload])
            .select()
            .single();

        // ====================================
        // ERROR SUPABASE
        // ====================================

        if (error) {

            console.error(
                "❌ SUPABASE ERROR:",
                error
            );

            alert(
                "Gagal menyimpan pesanan:\n\n" +
                error.message
            );

            return;
        }

        // ====================================
        // BERHASIL
        // ====================================

        console.log(
            "================================"
        );

        console.log(
            "✅ ORDER BERHASIL",
            data
        );

        console.log(
            "================================"
        );

        // ====================================
        // HAPUS CART
        // ====================================

        CART_KEYS.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(
            "🗑️ Cart berhasil dikosongkan."
        );

        // ====================================
        // NOTA
        // ====================================

        tampilkanNota(
            data,
            items,
            total
        );

    } catch (error) {

        console.error(
            "❌ CHECKOUT ERROR:",
            error
        );

        alert(
            "Terjadi kesalahan:\n\n" +
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;

            button.textContent =
                "Bayar Sekarang";
        }
    }
}

// ============================================
// HALAMAN SELESAI DIMUAT
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "================================"
        );

        console.log(
            "🛒 CHECKOUT BERHASIL DIMUAT"
        );

        console.log(
            "================================"
        );

        // ====================================
        // BACA CART
        // ====================================

        const cartData =
            getCartData();

        // ====================================
        // TAMPILKAN ITEM
        // ====================================

        renderCheckoutItems(
            cartData.items
        );

        // ====================================
        // TAMPILKAN TOTAL
        // ====================================

        renderTotal(
            cartData.total
        );

        // ====================================
        // USER
        // ====================================

        const user =
            getLocalUser();

        if (user) {

            const namaInput =
                document.getElementById(
                    "namaLengkap"
                );

            if (namaInput) {

                namaInput.value =
                    user.nama ??
                    user.name ??
                    user.full_name ??
                    user.username ??
                    "";
            }
        }

        // ====================================
        // FORM
        // ====================================

        const form =
            document.getElementById(
                "checkoutForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                processCheckout
            );

            console.log(
                "✅ Form checkout siap."
            );

        } else {

            console.warn(
                "⚠️ #checkoutForm tidak ditemukan."
            );
        }
    }
);