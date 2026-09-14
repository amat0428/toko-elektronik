import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client dari Environment Variable
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Hanya izinkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  // Cek apakah ada ID di URL query
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID produk tidak ditemukan di URL' });
  }

  try {
    // Ambil 1 produk dari database Supabase berdasarkan ID
    const { data: product, error } = await supabase
      .from('products') // Sesuaikan nama tabel kamu di Supabase (misal: products / product)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan di database' });
    }

    // Kirim respon sukses beserta data produk dari Supabase
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}