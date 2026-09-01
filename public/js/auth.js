document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      
      // Simpan session dummy
      localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
      alert('Login Berhasil!');
      window.location.href = 'index.html';
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Pendaftaran Berhasil! Silakan login.');
      window.location.href = 'login.html';
    });
  }
});

function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}