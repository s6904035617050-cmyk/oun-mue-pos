// ฟังก์ชันสำหรับส่งข้อความไปยัง Telegram
const sendTelegramNotification = async (orderDetails) => {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  // จัดรูปแบบข้อความแจ้งเตือน
  const message = `🛍️ *มีออเดอร์ใหม่เข้ามา!*
----------------------------
🧾 *รายการสินค้า:*
${orderDetails.items.map(item => `- ${item.name} x${item.quantity} (${item.price} บาท)`).join('\n')}
----------------------------
💰 *ราคารวมทั้งสิ้น:* ${orderDetails.totalAmount} บาท
⏰ *เวลา:* ${new Date().toLocaleString('th-TH')}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown', // ใช้ Markdown เพื่อตกแต่งตัวหนา/ขีดเส้น
      }),
    });

    if (response.ok) {
      console.log('ส่งแจ้งเตือน Telegram สำเร็จ!');
    } else {
      console.error('เกิดข้อผิดพลาดในการส่ง Telegram');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};
