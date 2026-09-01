export default function handler(req, res) {
  // Hanya menerima HTTP Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { email, password } = req.body || {};

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email dan password wajib diisi!'
    });
  }

  // Dummy user data untuk testing serverless
  if (email === "user@gmail.com" && password === "123456") {
    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: 'USR-001',
        name: 'User Dummy',
        email: email,
        role: 'user'
      },
      token: 'dummy-jwt-token-12345'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Email atau password salah!'
  });
}