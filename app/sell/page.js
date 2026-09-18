'use client';

import React, { useState } from 'react';

export default function SellPage() {
  // ข้อมูลรายการสินค้าตามหน้าเดิมของคุณ
  const [products] = useState([
    { sku: 'OM-CRM-XL', name: 'Oun-Mue Desk Pad Size XL - Cream Beige', size: '80x40cm', price: 690, stock: 30 },
    { sku: 'OM-GRY-S', name: 'Oun-Mue Desk Pad Size S - Space Gray', size: '30x25cm', price: 390, stock: 50 },
    { sku: 'OM-GRY-XL', name: 'Oun-Mue Desk Pad Size XL - Space Gray', size: '80x40cm', price: 690, stock: 30 },
    { sku: 'OM-GRN-S', name: 'Oun-Mue Desk Pad Size S - Matcha Green', size: '30x25cm', price: 390, stock: 50 },
    { sku: 'OM-GRN-XL', name: 'Oun-Mue Desk Pad Size XL - Matcha Green', size: '80x40cm', price: 690, stock: 30 },
    { sku: 'OM-PNK-S', name: 'Oun-Mue Desk Pad Size S - Dusty Rose', size: '30x25cm', price: 390, stock: 50 },
    { sku: 'OM-PNK-XL', name: 'Oun-Mue Desk Pad Size XL - Dusty Rose', size: '80x40cm', price: 690, stock: 30 },
    { sku: 'OM-WAL-S', name: 'Oun-Mue Desk Pad Size S - Walnut Wood', size: '30x25cm', price: 390, stock: 50 },
    { sku: 'OM-WAL-XL', name: 'Oun-Mue Desk Pad Size XL - Walnut Wood', size: '80x40cm', price: 690, stock: 30 },
    { sku: 'OM-CRM-S', name: 'Oun-Mue Desk Pad Size S - Cream Beige', size: '30x25cm', price: 390, stock: 48 },
  ]);

  const [cart, setCart] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // ฟังก์ชันเพิ่มสินค้า
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.sku === product.sku);
      if (existing) {
        return prevCart.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ฟังก์ชันยิง API แจ้งเตือนไปยัง Telegram
  const sendTelegramNotification = async (orderDetails) => {
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!token || !chatId) return;

    const itemsText = orderDetails.items
      .map((item) => `• ${item.name} (${item.size})\n  จำนวน: ${item.quantity} ชิ้น | ${item.price * item.quantity} บาท`)
      .join('\n');

    const message = `🛍️ *มีรายการสั่งซื้อใหม่ (OUN-MUE POS)*\n------------------------------------\n${itemsText}\n------------------------------------\n💰 *ยอดรวมทั้งสิ้น:* ${orderDetails.totalAmount} บาท\n⏰ *เวลา:* ${new Date().toLocaleString('th-TH')}`;

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

  // ชำระเงิน
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSending(true);

    await sendTelegramNotification({
      items: cart,
      totalAmount: totalAmount,
    });

    alert('บันทึกการขายและส่งแจ้งเตือน Telegram สำเร็จ!');
    setCart([]);
    setIsSending(false);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fcfbfa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '24px' }}>
          OUN-MUE
        </h1>

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* ตารางรายการสินค้า */}
          <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee', color: '#666' }}>
                  <th style={{ padding: '8px' }}>SKU</th>
                  <th style={{ padding: '8px' }}>ชื่อสินค้า</th>
                  <th style={{ padding: '8px' }}>ขนาด</th>
                  <th style={{ padding: '8px' }}>ราคา</th>
                  <th style={{ padding: '8px' }}>สต็อก</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.sku} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '500' }}>{item.sku}</td>
                    <td style={{ padding: '10px 8px' }}>{item.name}</td>
                    <td style={{ padding: '10px 8px', color: '#666' }}>{item.size}</td>
                    <td style={{ padding: '10px 8px' }}>{item.price}</td>
                    <td style={{ padding: '10px 8px' }}>{item.stock}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          backgroundColor: '#333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        + เพิ่ม
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* สรุปรายการสั่งซื้อ */}
          <div style={{ width: '320px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              รายการสั่งซื้อ
            </h2>

            {cart.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>ยังไม่มีรายการในตะกร้า</p>
            ) : (
              <div>
                {cart.map((item) => (
                  <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <div>
                      <div>{item.name}</div>
                      <div style={{ color: '#888', fontSize: '11px' }}>x{item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '500' }}>{item.price * item.quantity} บาท</div>
                  </div>
                ))}
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginBottom: '16px' }}>
                  <span>ยอดรวม</span>
                  <span>{totalAmount} บาท</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isSending}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: isSending ? '#ccc' : '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSending ? 'กำลังบันทึก...' : 'ชำระเงิน'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
