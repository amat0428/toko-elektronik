export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const mockOrders = [
    {
      orderId: 'ORD-1715000000000',
      totalAmount: 12850000,
      status: 'SELESAI',
      createdAt: '2026-08-20T10:00:00Z',
      itemsCount: 2
    },
    {
      orderId: 'ORD-1715100000000',
      totalAmount: 4500000,
      status: 'DIPROSES',
      createdAt: '2026-08-28T14:30:00Z',
      itemsCount: 1
    }
  ];

  return res.status(200).json({ success: true, data: mockOrders });
}