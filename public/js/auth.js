// 1. Inisialisasi Supabase
const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_JStXk700ejTvHYnjAHlCYA_1tf1Kccp";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // 2. FUNGSI REGISTRASI
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('regName').value.trim();
      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const btn = registerForm.querySelector('button[type="submit"]');

      if (btn) {
        btn.innerText = "Memproses...";
        btn.disabled = true;
      }

      const { data, error } = await supabaseClient
        .from('users_list')
        .insert([{ name, username, password, role: 'user' }]);

      if (error) {
        alert("Gagal mendaftar: " + error.message);
        if (btn) {
          btn.innerText = "DAFTAR SEKARANG";
          btn.disabled = false;
        }
      } else {
        alert("Registrasi Berhasil! Akun Anda sudah tersimpan.");
        window.location.href = 'login.html';
      }
    });
  }

  // 3. FUNGSI LOGIN (SINKRONISASI KEY LOCALSTORAGE)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value.trim();

      const { data: users, error } = await supabaseClient
        .from('users_list')
        .select('*')
        .eq('username', usernameInput)
        .eq('password', passwordInput);

      if (error) {
        alert("Terjadi kesalahan sistem: " + error.message);
        return;
      }

      if (users && users.length > 0) {
        const currentUser = users[0];
        
        // Simpan dengan key 'user' dan 'currentUser' agar semua halaman kompatibel
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert(`Selamat datang kembali, ${currentUser.name || currentUser.username}!`);
        
        if (currentUser.role === 'admin' || currentUser.username === 'admin1@gmail.com' || currentUser.username === 'admin') {
          window.location.href = '/admin/dashboard.html';
        } else {
          window.location.href = 'toko.html';
        }

      } else {
        alert("Username atau Password salah!");
      }
    });
  }
});