import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://PROJECT-ID.supabase.co';

const supabaseKey = 'ANON-KEY-KAMU';

const supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);
export default async function handler(req, res) {
  // 1. GET: Ambil daftar semua pesanan dari database Supabase
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('orders') // Sesuaikan nama tabel kamu di Supabase
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || []
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. PUT / PATCH: Admin menambah, mengurangi jumlah, atau mengubah status pesanan
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { orderId, itemsCount, status } = req.body;

      if (!orderId) {
        return res.status(400).json({ success: false, message: 'orderId wajib diisi' });
      }

      // Siapkan payload update
      const updatePayload = {};
      if (itemsCount !== undefined) updatePayload.itemsCount = itemsCount; // atau jumlah_pesanan
      if (status !== undefined) updatePayload.status = status;

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId) // Jika kolom primary key kamu 'orderId', ganti 'id' jadi 'orderId'
        .select();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Pesanan berhasil diperbarui',
        data
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Jika method HTTP selain GET, PUT, atau PATCH
  res.setHeader('Allow', ['GET', 'PUT', 'PATCH']);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}