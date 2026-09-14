// 1. Inisialisasi Supabase
const SUPABASE_URL = "https://fbnknnrltrsvydyxgujr.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtubnJsdHJzdnlkeXhndWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA0MjYsImV4cCI6MjEwMzgxNjQyNn0.A46kddQQFKt8C-Kvq8Gt753acdEctsh7XibfMWKKP9o"; 

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

      // Default role saat daftar adalah 'user'
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

  // 3. FUNGSI LOGIN (SUDAH DIBENAHI UNTUK ADMIN)
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
        
        // Simpan status login di LocalStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert(`Selamat datang kembali, ${currentUser.name || currentUser.username}!`);
        
        // CEK APAKAH AKUN ADMIN
        // Bisa pakai kolom role ATAU cek langsung username-nya 'admin1@gmail.com' / 'admin'
        if (currentUser.role === 'admin' || currentUser.username === 'admin1@gmail.com' || currentUser.username === 'admin') {
          window.location.href = '/admin/dashboard.html'; // Arahkan ke Dashboard Admin
        } else {
          window.location.href = 'toko.html'; // Arahkan ke Toko untuk User biasa
        }

      } else {
        alert("Username atau Password salah! Jika belum punya akun, silakan daftar.");
      }
    });
  }
});