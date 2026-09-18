'use client';

import React, { useState } from 'react';

export default function SellPage() {
  // สมมุติตัวอย่างสินค้าในร้าน
  const [products] = useState([
    { id: 1, name: 'สินค้า A', price: 100 },
    { id: 2, name: 'สินค้า B', price: 150 },
    { id: 3, name: 'สินค้า C', price: 200 },
  ]);

  // สถานะรายการสินค้าในตะกร้า
  const [cart, setCart] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // เพิ่มสินค้าเข้าตะกร้า
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // คำนวณราคารวม
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ฟังก์ชันยิงแจ้งเตือนไปยัง Telegram
  const sendTelegramNotification = async (orderDetails) => {
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('Missing Telegram Environment Variables');
      return;
    }

    // จัดข้อความแจ้งเตือน
    const itemsText = orderDetails.items
      .map((item) => `- ${item.name} x${item.quantity} (${item.price * item.quantity} บาท)`)
      .join('\n');

    const message = `🛍️ *มีออเดอร์ใหม่เข้ามา!*\n----------------------------\n🧾 *รายการสินค้า:*\n${itemsText}\n----------------------------\n💰 *ราคารวมทั้งสิ้น:* ${orderDetails.totalAmount} บาท\n⏰ *เวลา:* ${new Date().toLocaleString('th-TH')}`;

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

  // ปุ่มชำระเงิน
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าก่อนชำระเงิน');
      return;
    }

    setIsSending(true);

    const orderDetails = {
      items: cart,
      totalAmount: totalAmount,
    };

    // ส่งข้อความแจ้งเตือนไป Telegram
    await sendTelegramNotification(orderDetails);

    alert('ชำระเงินสำเร็จ และส่งแจ้งเตือนเรียบร้อยแล้ว!');
    setCart([]);
    setIsSending(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ระบบขายหน้าร้าน (POS)</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* ฝั่งรายการสินค้า */}
        <div style={{ flex: 1 }}>
          <h2>รายการสินค้า</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <h3>{product.name}</h3>
                <p>{product.price} บาท</p>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  + เพิ่มเข้าตะกร้า
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ฝั่งตะกร้าสินค้า */}
        <div
          style={{
            width: '300px',
            border: '1px solid #ccc',
            padding: '15px',
            borderRadius: '8px',
          }}
        >
          <h2>ตะกร้าสินค้า</h2>
          {cart.length === 0 ? (
            <p>ยังไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{item.price * item.quantity} บาท</span>
                </div>
              ))}
              <hr style={{ margin: '15px 0' }} />
              <h3>ราคารวม: {totalAmount} บาท</h3>
              <button
                onClick={handleCheckout}
                disabled={isSending}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: isSending ? '#ccc' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                }}
              >
                {isSending ? 'กำลังส่งข้อมูล...' : 'ชำระเงิน'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
