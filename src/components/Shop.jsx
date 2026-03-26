import React from 'react';
import './Shop.css';

const products = [
    {
        id: 1,
        name: 'プレミアムリペアシャンプー',
        price: 3500,
        description: '100%天然由来成分配合。ダメージを受けた髪を優しく洗い上げ、内側から補修します。',
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop'
    },
    {
        id: 2,
        name: '高保湿ヘアオイル',
        price: 2800,
        description: '重くならずにサラサラな指通りを実現。熱や紫外線から髪を守る万能オイルです。',
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'
    },
    {
        id: 3,
        name: 'スカルプケアエッセンス',
        price: 4200,
        description: '健康な髪は健やかな頭皮から。フケや痒みを抑え、美しい髪の土台を作ります。',
        image: 'https://images.unsplash.com/photo-1629367494173-c78a56567877?w=400&h=400&fit=crop'
    }
];

const Shop = () => {
    return (
        <div className="shop-container">
            <header className="shop-header">
                <h1>Hair Salon Demo</h1>
                <p>サロン品質のケアをご自宅でも</p>
            </header>

            <div className="product-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            <img src={product.image} alt={product.name} className="product-image" />
                        </div>
                        <div className="product-info">
                            <h2 className="product-name">{product.name}</h2>
                            <p className="product-description">{product.description}</p>
                            <div className="product-price">¥{product.price.toLocaleString()}</div>
                            <button
                                className="purchase-button"
                                onClick={() => alert(`${product.name}をカートに追加しました`)}
                            >
                                購入する
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
