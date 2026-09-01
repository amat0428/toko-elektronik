// 1. Inisialisasi Supabase
// PENTING: Ganti 'https://PROJECT_ID_KAMU.supabase.co' dengan URL Supabase asli milikmu!
const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o"; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // 2. FUNGSI REGISTRASI (SIMPAN KE SUPABASE)
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

      // Kirim data ke tabel 'users_list' di Supabase
      const { data, error } = await supabaseClient
        .from('users_list')
        .insert([{ name, username, password }]);

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

  // 3. FUNGSI LOGIN (CEK KE SUPABASE)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value.trim();

      // Cek apakah username dan password cocok di Supabase
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
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert(`Selamat datang kembali, ${currentUser.name || currentUser.username}!`);
        window.location.href = 'index.html';
      } else {
        alert("Username atau Password salah! Jika belum punya akun, silakan daftar.");
      }
    });
  }
});