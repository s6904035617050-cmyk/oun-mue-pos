"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true })
    if (error) console.error(error)
    else setProducts(data || [])
    setLoading(false)
  }

  async function updateStock(id, newStock) {
    if (newStock < 0) return
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id)
    if (error) alert('อัปเดตสต๊อกไม่สำเร็จ')
    else fetchProducts()
  }

  return (
    <div className="card">
      <h2>📦 คลังสินค้า OUN-MUE</h2>
      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>ชื่อสินค้า</th>
              <th>ขนาด</th>
              <th>ราคา</th>
              <th>คงเหลือ (สต๊อก)</th>
              <th>ปรับสต๊อก</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><strong>{p.sku}</strong></td>
                <td>{p.name}</td>
                <td>{p.size}</td>
                <td style={{ color: '#c86b59', fontWeight: 'bold' }}>฿{p.price.toLocaleString()}</td>
                <td>{p.stock} {p.unit}</td>
                <td>
                  <button className="btn" style={{ padding: '4px 10px', marginRight: '5px' }} onClick={() => updateStock(p.id, p.stock - 1)}>-</button>
                  <button className="btn" style={{ padding: '4px 10px' }} onClick={() => updateStock(p.id, p.stock + 1)}>+</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
