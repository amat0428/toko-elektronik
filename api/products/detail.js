export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const products = [
    {
      id: "1",
      name: "Laptop Gaming RGB 15 Inch",
      price: 12500000,
      category: "Laptop",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60",
      description: "Processor Intel i7 Gen 13, RAM 16GB, SSD 512GB NVMe, RTX 4050."
    },
    {
      id: "2",
      name: "Smartphone 5G 128GB",
      price: 4500000,
      category: "HP",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
      description: "Layar AMOLED 120Hz, Kamera Utama 64MP, Baterai 5000mAh Fast Charging 67W."
    },
    {
      id: "3",
      name: "TWS Wireless Earbuds Pro",
      price: 350000,
      category: "Aksesoris",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60",
      description: "Active Noise Cancellation (ANC), Bluetooth 5.3, Daya tahan baterai hingga 30 Jam."
    },
    {
      id: "4",
      name: "Smartwatch Sport Edition",
      price: 850000,
      category: "Aksesoris",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
      description: "Monitoring Detak Jantung 24/7, SpO2, Waterproof 5ATM, Layar HD Color Display."
    }
  ];

  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
  }

  return res.status(200).json({ success: true, data: product });
}