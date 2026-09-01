export default function handler(req, res) {
  // Hanya menerima HTTP Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, email, password } = req.body || {};

  // Validasi input sederhana
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nama, email, dan password wajib diisi!'
    });
  }

  // Simulasi sukses registrasi akun
  const newUser = {
    id: 'USR-' + Date.now(),
    name,
    email,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  return res.status(201).json({
    success: true,
    message: 'Registrasi berhasil! Silakan login.',
    user: newUser
  });
}