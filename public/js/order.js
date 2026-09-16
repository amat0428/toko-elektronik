// ==========================================
// KONFIGURASI SUPABASE
// ==========================================

const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co";

// PENTING:
// Gunakan Publishable/Anon Key yang SAMA dengan checkout.js
const SUPABASE_KEY = "sb_publishable_JStXk700ejTvHYnjAHlCYA_1tf1Kccp";

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

    const userData = localStorage.getItem("user");

    let currentUser = null;

    if (userData) {
        try {
            currentUser = JSON.parse(userData);

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
            "❌ ordersContainer tidak ditemukan."
        );
        return;
    }

    // ======================================
    // CEK USER
    // ======================================

    const userId = user
        ? (user.id || user.user_id)
        : null;

    console.log("👤 User saat ini:", user);
    console.log("🆔 User ID:", userId);

    if (!userId) {

        container.innerHTML = `
            <div class="empty-state">
                <p style="color:#ef4444;">
                    User belum login.
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
    // QUERY ORDERS
    // ======================================

    try {

        console.log("🔎 Mengambil orders untuk user:", userId);

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
        // ERROR
        // ==================================

        if (error) {

            console.error(
                "❌ Supabase error:",
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

        console.log("📦 Orders dari Supabase:", orders);

        // ==================================
        // TIDAK ADA PESANAN
        // ==================================

        if (!orders || orders.length === 0) {

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
                        Mulai Belanja
                    </a>

                </div>
            `;

            return;
        }

        // ==================================
        // RENDER SEMUA PESANAN
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

                <p style="color:#ef4444;">
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