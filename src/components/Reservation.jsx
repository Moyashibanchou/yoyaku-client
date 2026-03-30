import React from 'react';
import './Shop.css';

const Reservation = () => {
    return (
        <div className="shop-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <header className="shop-header">
                <h1>Hair Salon Demo</h1>
                <p>予約システム</p>
            </header>
            <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%' }}>
                <h2 style={{ color: '#4a4a4a', marginBottom: '1rem', fontWeight: 500 }}>ご予約はこちらから</h2>
                <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '2rem' }}>
                    （※現在こちらの予約画面は準備中です。別途予約システムを構築するフェーズとなります。）
                </p>
                <button
                    className="purchase-button"
                    onClick={() => alert('予約機能は準備中です。')}
                    style={{ maxWidth: '300px', margin: '0 auto', display: 'block' }}
                >
                    予約空き状況を確認する
                </button>
            </div>
            <div style={{ marginTop: '2rem' }}>
                <a href="/shop" style={{ color: '#8c8477', textDecoration: 'underline' }}>オンラインショップを見る</a>
            </div>
        </div>
    );
};

export default Reservation;
