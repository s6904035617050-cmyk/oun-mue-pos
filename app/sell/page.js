"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SellPage() {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => setProducts(data || []))
  }, [])

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0

  async function handleSell(e) {
    e.preventDefault()
    if (!selectedProduct) return alert('กรุณาเลือกสินค้า')
    if (quantity > selectedProduct.stock) return alert('สินค้าในสต๊อกไม่พอขาย!')

    setLoading(true)

    // 1. บันทึกประวัติการขาย
    const { error: saleError } = await supabase.from('sales').insert([{
      product_id: selectedProduct.id,
      product_name: `${selectedProduct.name} (${selectedProduct.size})`,
      quantity: Number(quantity),
      total_price: totalPrice
    }])

    if (saleError) {
      alert('เกิดข้อผิดพลาดในการบันทึกการขาย')
      setLoading(false)
      return
    }

    // 2. ตัดสต๊อกสินค้า
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: selectedProduct.stock - quantity })
      .eq('id', selectedProduct.id)

    if (updateError) {
      alert('บันทึกยอดขายได้ แต่หักสต๊อกล้มเหลว')
    } else {
      alert('✨ บันทึกการขายสำเร็จ และตัดสต๊อกเรียบร้อย!')
      setQuantity(1)
      setSelectedProductId('')
      // รีโหลดรายการสินค้าใหม่
      const { data } = await supabase.from('products').select('*')
      setProducts(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>🛒 หน้าขายสินค้า (POS)</h2>
      <form onSubmit={handleSell}>
        <div className="form-group">
          <label>เลือกสินค้า OUN-MUE</label>
          <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required>
            <option value="">-- เลือกรายการสินค้า --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.size}) - ฿{p.price} [คงเหลือ: {p.stock}]
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>จำนวนที่ขาย</label>
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
        </div>

        <div style={{ background: '#faf8f5', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c86b59' }}>
            ราคารวมทั้งหมด: ฿{totalPrice.toLocaleString()}
          </p>
        </div>

        <button type="submit" className="btn" style={{ width: '100%', padding: '12px' }} disabled={loading}>
          {loading ? 'กำลังบันทึก...' : '✨ ยืนยันการขาย (ตัดสต๊อก)'}
        </button>
      </form>
    </div>
  )
}
