'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลสินค้าจาก Supabase
  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => setProducts(data || []));
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  // ฟังก์ชันส่งแจ้งเตือน Telegram
  const sendTelegramNotification = async (productName, qty, total) => {
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!token || !chatId) return;

    const message = `🛍️ *มีรายการขายใหม่ (OUN-MUE POS)*\n------------------------------------\n📦 *สินค้า:* ${productName}\n🔢 *จำนวน:* ${qty} ชิ้น\n💰 *ราคารวม:* ${total} บาท\n⏰ *เวลา:* ${new Date().toLocaleString('th-TH')}`;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  };

  async function handleSell(e) {
    e.preventDefault();
    if (!selectedProduct) return alert('กรุณาเลือกสินค้า');
    if (quantity > selectedProduct.stock) return alert('สินค้าในสต๊อกไม่พอขาย');

    setLoading(true);

    // 1. บันทึกประวัติการขายลง Supabase
    const { error: saleError } = await supabase.from('sales').insert([
      {
        product_id: selectedProduct.id,
        product_name: `${selectedProduct.name} (${selectedProduct.size})`,
        quantity: Number(quantity),
        total_price: totalPrice,
      },
    ]);

    if (saleError) {
      alert('เกิดข้อผิดพลาดในการบันทึกการขาย');
      setLoading(false);
      return;
    }

    // 2. ตัดสต๊อกสินค้าใน Supabase
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: selectedProduct.stock - quantity })
      .eq('id', selectedProduct.id);

    if (updateError) {
      alert('ตัดสต๊อกไม่สำเร็จ');
    } else {
      // 3. ส่งข้อความแจ้งเตือนไปที่ Telegram Channel
      await sendTelegramNotification(
        `${selectedProduct.name} (${selectedProduct.size})`,
        quantity,
        totalPrice
      );

      alert('บันทึกการขายสำเร็จ และตัดสต๊อกเรียบร้อย!');
      // รีเฟรชข้อมูลสินค้าใหม่
      const { data } = await supabase.from('products').select('*');
      setProducts(data || []);
      setSelectedProductId('');
      setQuantity(1);
    }

    setLoading(false);
  }

  return (
    <div className="card">
      <h2>หน้าขายสินค้า (POS)</h2>
      <form onSubmit={handleSell} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>เลือกรุ่นแผ่นรองเมาส์ OUN-MUE</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="">-- เลือกรายการสินค้า --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.size}) - {p.price} บาท (คงเหลือ: {p.stock})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>จำนวนที่ขาย</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#4a3e3d' }}>
          ราคารวมทั้งหมด: ฿{totalPrice}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#4a3e3d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกการขาย'}
        </button>
      </form>
    </div>
  );
}
