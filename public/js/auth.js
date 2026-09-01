// Logika Pendaftaran dan Autentikasi User Sederhana (LocalStorage)

document.addEventListener('DOMContentLoaded', () => {

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // 1. PROSES REGISTRASI (Daftar Akun Baru)
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('regName').value.trim();
      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regPassword').value.trim();

      if (!username || !password) {
        alert('Harap isi username dan password!');
        return;
      }

      // Simpan data akun ke LocalStorage
      const newUser = { name, username, password };
      localStorage.setItem('registeredUser', JSON.stringify(newUser));

      alert('Registrasi Berhasil! Silakan login dengan akun baru Anda.');
      window.location.href = 'login.html';
    });
  }

  // 2. PROSES LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value.trim();

      // Ambil data user yang terdaftar dari LocalStorage
      const savedUser = JSON.parse(localStorage.getItem('registeredUser'));

      // Jika belum ada user yang terdaftar di sistem
      if (!savedUser) {
        alert('Akun belum terdaftar! Silakan klik daftar terlebih dahulu.');
        window.location.href = 'register.html';
        return;
      }

      // Validasi cocok/tidaknya Username & Password
      if (savedUser.username === usernameInput && savedUser.password === passwordInput) {
        // Simpan status bahwa user sedang LOGIN
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        
        alert(`Selamat datang kembali, ${savedUser.name || savedUser.username}!`);
        window.location.href = 'index.html';
      } else {
        alert('Username atau Password salah!');
      }
    });
  }

});

// 3. FUNGSI CEK STATUS LOGIN (Bisa ditaruh di index.html untuk memproteksi halaman)
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    alert('Anda harus login terlebih dahulu!');
    window.location.href = 'login.html';
  }
}

// 4. FUNGSI LOGOUT
function logoutUser() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}