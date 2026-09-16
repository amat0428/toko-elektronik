// ==========================================
// KONFIGURASI SUPABASE
// ==========================================

const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o";

// ==========================================
// INISIALISASI SUPABASE
// ==========================================

let _supabase = null;

if (typeof supabase !== "undefined") {
    _supabase = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    console.log("✅ Supabase berhasil diinisialisasi");
} else {
    console.error("❌ Supabase JS belum dimuat.");
}

// ==========================================
// SAAT HALAMAN SELESAI DIMUAT
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("📋 Halaman orders dimuat");

    const userData = localStorage.getItem("user");

    let currentUser = null;

    // ======================================
    // AMBIL USER
    // ======================================

    if (userData) {
        try {

            currentUser = JSON.parse(userData);

            console.log("👤 User ditemukan:", currentUser);

            const name =
                currentUser.name ||
                currentUser.user_name ||
                currentUser.username ||
                currentUser.email ||
                "Pengguna";

            const userNameEl =
                document.getElementById("userName");

            const userInitialEl =
                document.getElementById("userInitial");

            if (userNameEl) {
                userNameEl.innerText = name;
            }

            if (userInitialEl) {
                userInitialEl.innerText =
                    name.charAt(0).toUpperCase();
            }

        } catch (error) {

            console.error(
                "❌ Gagal membaca profil user:",
                error
            );

        }
    }

    // ======================================
    // LOAD ORDERS
    // ======================================

    await loadOrders(currentUser);

});

// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders(user) {

    const container =
        document.getElementById("ordersContainer");

    if (!container) {

        console.error(
            "❌ Element #ordersContainer tidak ditemukan."
        );

        return;
    }

    // ======================================
    // CEK USER
    // ======================================

    if (!user) {

        console.error("❌ User tidak ditemukan.");

        container.innerHTML = `
            <div class="empty-state">

                <p style="
                    color:#ef4444;
                    font-weight:bold;
                ">
                    User belum login.
                </p>

                <a
                    href="login.html"
                    class="btn-shop"
                >
                    Login
                </a>

            </div>
        `;

        return;
    }

    // ======================================
    // AMBIL USER ID
    // ======================================

    const userId =
        user.id !== undefined && user.id !== null
            ? user.id
            : user.user_id;

    console.log("🆔 User ID:", userId);
    console.log("🔎 Tipe User ID:", typeof userId);

    if (
        userId === undefined ||
        userId === null ||
        userId === ""
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <p style="color:#ef4444;">
                    ID user tidak ditemukan.
                </p>

            </div>
        `;

        return;
    }

    // ======================================
    // CEK SUPABASE
    // ======================================

    if (!_supabase) {

        container.innerHTML = `
            <div class="empty-state">

                <p style="color:#ef4444;">
                    Koneksi Supabase belum tersedia.
                </p>

            </div>
        `;

        return;
    }

    // ======================================
    // AMBIL DATA ORDERS
    // ======================================

    try {

        console.log(
            "🔎 Mengambil pesanan user:",
            userId
        );

        const {
            data: orders,
            error
        } = await _supabase
            .from("orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", {
                ascending: false
            });

        // ==================================
        // CEK ERROR SUPABASE
        // ==================================

        if (error) {

            console.error(
                "❌ SUPABASE ERROR:",
                error
            );

            container.innerHTML = `
                <div class="empty-state">

                    <p style="
                        color:#ef4444;
                        font-weight:bold;
                    ">
                        Gagal mengambil data pesanan.
                    </p>

                    <p style="
                        margin-top:8px;
                        font-size:13px;
                        color:#64748b;
                    ">
                        ${escapeHTML(error.message)}
                    </p>

                </div>
            `;

            return;
        }

        // ==================================
        // DATA BERHASIL
        // ==================================

        console.log(
            "📦 Data orders:",
            orders
        );

        // ==================================
        // TIDAK ADA PESANAN
        // ==================================

        if (!orders || orders.length === 0) {

            console.log(
                "ℹ️ Belum ada pesanan untuk user:",
                userId
            );

            container.innerHTML = `
                <div class="empty-state">

                    <p style="
                        font-size:16px;
                        color:#64748b;
                    ">
                        Belum ada pesanan yang dibuat.
                    </p>

                    <a
                        href="toko.html"
                        class="btn-shop"
                    >
                        🛍️ Mulai Belanja
                    </a>

                </div>
            `;

            return;
        }

        // ==================================
        // RENDER ORDERS
        // ==================================

        container.innerHTML = orders
            .map(function (order) {
                return renderOrder(order);
            })
            .join("");

        console.log(
            `✅ Berhasil memuat ${orders.length} pesanan.`
        );

    } catch (error) {

        console.error(
            "❌ Terjadi kesalahan:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">

                <p style="
                    color:#ef4444;
                    font-weight:bold;
                ">
                    Terjadi kesalahan saat memuat pesanan.
                </p>

                <p style="
                    margin-top:8px;
                    font-size:13px;
                    color:#64748b;
                ">
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;
    }
}

// ==========================================
// RENDER SATU PESANAN
// ==========================================

function renderOrder(order) {

    // ======================================
    // PARSE ITEMS
    // ======================================

    let items = [];

    try {

        if (typeof order.items === "string") {

            items = JSON.parse(order.items);

        } else if (Array.isArray(order.items)) {

            items = order.items;

        }

    } catch (error) {

        console.warn(
            "⚠️ Gagal membaca items:",
            error
        );

        items = [];
    }

    // ======================================
    // TANGGAL
    // ======================================

    const dateFormatted =
        order.created_at
            ? new Date(
                order.created_at
            ).toLocaleString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
            : "Baru saja";

    // ======================================
    // STATUS
    // ======================================

    const statusText =
        order.status ||
        "Menunggu Konfirmasi";

    const statusLower =
        String(statusText).toLowerCase();

    const statusClass =
        statusLower === "selesai"
            ? "selesai"
            : "";

    // ======================================
    // ID PESANAN
    // ======================================

    const orderId =
        order.id ||
        order.order_id ||
        "N/A";

    // ======================================
    // ITEMS HTML
    // ======================================

    let itemsHtml = "";

    if (items.length > 0) {

        itemsHtml = items
            .map(function (item) {

                const itemName =
                    item.name ||
                    item.title ||
                    item.nama ||
                    item.nama_produk ||
                    item.product_name ||
                    "Produk";

                const qty =
                    Number(
                        item.qty ||
                        item.quantity ||
                        1
                    );

                const price =
                    Number(
                        item.price ||
                        item.harga ||
                        item.harga_produk ||
                        0
                    );

                const subtotal =
                    price * qty;

                return `
                    <div class="item-row">

                        <span>
                            ${escapeHTML(itemName)}
                            (x${qty})
                        </span>

                        <span>
                            Rp ${subtotal.toLocaleString("id-ID")}
                        </span>

                    </div>
                `;

            })
            .join("");

    } else {

        itemsHtml = `
            <div class="item-row">

                <span>
                    Detail produk tidak tersedia
                </span>

            </div>
        `;
    }

    // ======================================
    // TOTAL HARGA
    // ======================================

    const totalHarga =
        Number(
            order.total_harga ||
            order.total ||
            order.total_price ||
            0
        );

    // ======================================
    // RETURN CARD
    // ======================================

    return `
        <div class="order-card">

            <div class="order-header">

                <div>

                    <div class="order-id">
                        ID Pesanan:
                        #${escapeHTML(String(orderId))}
                    </div>

                    <div class="order-date">
                        ${dateFormatted}
                    </div>

                </div>

                <span class="status-badge ${statusClass}">
                    ${escapeHTML(String(statusText))}
                </span>

            </div>

            <div class="item-list">
                ${itemsHtml}
            </div>

            <div class="order-footer">

                <span>
                    Total Pembayaran:
                </span>

                <span class="total-price">
                    Rp ${totalHarga.toLocaleString("id-ID")}
                </span>

            </div>

            <!-- ==================================
                 TOMBOL BELANJA
                 ================================== -->

            <div style="
                padding:15px 20px;
                border-top:1px solid #e5e7eb;
                text-align:right;
            ">

                <a
                    href="toko.html"
                    class="btn-shop"
                    style="
                        display:inline-block;
                        padding:10px 18px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:600;
                        transition:0.2s;
                    "
                >
                    🛍️ Belanja Lagi
                </a>

            </div>

        </div>
    `;
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}