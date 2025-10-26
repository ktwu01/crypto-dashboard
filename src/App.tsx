import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import RealtimeKline from './pages/RealtimeKline'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '8px', borderBottom: '1px solid #333' }}>
        <Link to="/">首页</Link>
        <span style={{ marginLeft: 12 }} />
        <Link to="/realtime-kline">实时K线</Link>
      </nav>

      <Routes>
        <Route path="/" element={<div style={{ padding: 16 }}>欢迎使用 Crypto Dashboard</div>} />
        <Route path="/realtime-kline" element={<RealtimeKline />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
