"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function HistoryPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('sales').select('*').order('sold_at', { ascending: false }).then(({ data }) => {
      setSales(data || [])
      setLoading(false)
    })
  }, [])

  const totalRevenue = sales.reduce((sum, item) => sum + Number(item.total_price), 0)

  return (
    <div className="card">
      <h2>📜 ประวัติการขายทั้งหมด</h2>
      <div style={{ background: '#f5efe6', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3 style={{ color: '#4a3e3d' }}>ยอดขายสะสมรวม: <span style={{ color: '#c86b59' }}>฿{totalRevenue.toLocaleString()}</span></h3>
      </div>

      {loading ? <p>กำลังโหลดประวัติ...</p> : (
        <table>
          <thead>
            <tr>
              <th>วันเวลาที่ขาย</th>
              <th>รายการสินค้า</th>
              <th>จำนวน</th>
              <th>ยอดขายรวม</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>ยังไม่มีรายการขาย</td></tr>
            ) : (
              sales.map(s => (
                <tr key={s.id}>
                  <td>{new Date(s.sold_at).toLocaleString('th-TH')}</td>
                  <td><strong>{s.product_name}</strong></td>
                  <td>{s.quantity}</td>
                  <td style={{ color: '#c86b59', fontWeight: 'bold' }}>฿{Number(s.total_price).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
