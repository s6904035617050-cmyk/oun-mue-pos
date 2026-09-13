import './globals.css'

export const metadata = {
  title: 'OUN-MUE (อุ่นมือ) - Mini POS System',
  description: 'ระบบจัดการขายหน้าร้านและคลังสินค้า OUN-MUE',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <header className="navbar">
          <div className="logo">OUN-MUE (อุ่นมือ) POS</div>
          <nav className="nav-links">
            <a href="/">📦 คลังสินค้า</a>
            <a href="/sell">🛒 หน้าขาย POS</a>
            <a href="/history">📜 ประวัติการขาย</a>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  )
}
