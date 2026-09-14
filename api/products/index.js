import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // 1. GET: Ambil semua produk atau 1 produk jika ada query ?id=...
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (id) {
        // Ambil detail 1 produk
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      // Ambil seluruh daftar produk
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. POST: Menambah produk baru
  if (req.method === 'POST') {
    try {
      const { nama, harga, stok, deskripsi, image } = req.body;

      if (!nama || harga === undefined) {
        return res.status(400).json({ success: false, message: 'Nama dan harga produk wajib diisi.' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ nama, harga, stok: stok || 0, deskripsi, image }])
        .select();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. PUT / PATCH: Mengedit produk / Restok produk (Admin)
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { id, nama, harga, stok, deskripsi, image } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID produk wajib dikirim.' });
      }

      // Susun objek update hanya untuk data yang dikirim
      const updateData = {};
      if (nama !== undefined) updateData.nama = nama;
      if (harga !== undefined) updateData.harga = harga;
      if (stok !== undefined) updateData.stok = stok;
      if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
      if (image !== undefined) updateData.image = image;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Produk berhasil diperbarui', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 4. DELETE: Menghapus produk berdasarkan ID
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID produk diperlukan untuk menghapus.' });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true, message: `Produk dengan ID ${id} berhasil dihapus.` });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 5. Jika method lain dipanggil
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}