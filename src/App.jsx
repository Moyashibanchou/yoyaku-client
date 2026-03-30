import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Reservation from './components/Reservation';
import Shop from './components/Shop';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Reservation />} />
        <Route path="/shop" element={<Shop />} />
        {/* その他の無効なURLにアクセスした場合のフォールバック */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
            <h2>404 Not Found</h2>
            <p>お探しのページは見つかりませんでした。</p>
            <Link to="/shop" style={{ color: '#2c3e50', textDecoration: 'underline' }}>ショップへ戻る</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
