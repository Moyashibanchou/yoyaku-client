import React, { useState, useEffect } from 'react';
import './Reservation.css';
import { useNavigate } from 'react-router-dom';
import TimeSlotCalendar from './TimeSlotCalendar';
import { Scissors, User, Calendar, Tag, ChevronLeft } from 'lucide-react';
import liff from '@line/liff';

const Reservation = () => {
    // クーポンデータ
    const coupons = [
        { id: 'none', label: 'クーポンを利用しない', type: 'none', amount: 0 },
        { id: 'new20', label: '初回限定20%OFF', type: 'percent', amount: 20 },
        { id: 'line1000', label: 'LINEお友だち登録 1000円引', type: 'fixed', amount: 1000 },
    ];

    const [step, setStep] = useState(1);
    const [reservationData, setReservationData] = useState({
        menu: null,
        staff: null,
        date: '',
        time: '',
        coupon: coupons[0],
        userName: '',
        userPhone: ''
    });
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const [isLiffReady, setIsLiffReady] = useState(false);

    // LIFF初期化
    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ liffId: '2009587376-SnE3T7WY' });
                console.log('LIFF init success');
                setIsLiffReady(true);

                // 自動ログインの実装：ログインしていなければ直ちにログイン（認可）画面へ
                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }

                // 初期化成功後、ログイン済みならプロフィールを取得して名前を自動入力
                try {
                    const profile = await liff.getProfile();
                    setReservationData(prev => ({
                        ...prev,
                        userName: prev.userName || profile.displayName
                    }));
                } catch (profileErr) {
                    console.error('LINEプロフィールの取得に失敗しました', profileErr);
                }
            } catch (err) {
                console.error('LIFF initialization failed', err);
            }
        };
        initLiff();
    }, []);

    // 1. メニューデータ
    const menus = [
        { id: 'cut', name: 'カット', price: '¥5,000', time: '60分' },
        { id: 'color', name: 'カラー', price: '¥7,000', time: '90分' },
        { id: 'cut_color', name: 'カット + カラー', price: '¥11,000', time: '120分' },
        { id: 'perm', name: 'パーマ', price: '¥8,000', time: '120分' },
        { id: 'treatment', name: 'トリートメント', price: '¥4,000', time: '30分' }
    ];

    // 2. スタッフデータ
    const staffs = [
        {
            id: 'staff1', name: '佐藤 健太', gender: 'male', age: '28', experience: '5年',
            specialty: 'ショートカット・パーマ', message: '丁寧なカウンセリングでお悩みを解決します！',
            image: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&h=400&fit=crop&q=80'
        },
        {
            id: 'staff2', name: '鈴木 結衣', gender: 'female', age: '25', experience: '3年',
            specialty: 'カラー・透明感カラー', message: 'お客様に似合うトレンドカラーをご提案します♪',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80'
        },
        {
            id: 'staff3', name: '高橋 翔', gender: 'male', age: '32', experience: '10年',
            specialty: 'メンズカット・フェード', message: '骨格に合わせたカットならお任せください。',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80'
        },
        {
            id: 'staff4', name: '田中 美咲', gender: 'female', age: '29', experience: '7年',
            specialty: 'ボブ・ヘアアレンジ', message: '毎日のスタイリングが楽しくなる髪型に！',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80'
        }
    ];

    const filteredStaffs = staffs.filter(s => filter === 'all' || s.gender === filter);

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const handleSelectMenu = (menu) => {
        setReservationData({ ...reservationData, menu });
        handleNext();
    };

    const handleSelectStaff = (staff) => {
        setReservationData({ ...reservationData, staff });
        handleNext();
    };

    const handleSelectDateTime = (date, time) => {
        setReservationData({ ...reservationData, date, time });
        handleNext();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReservationData({ ...reservationData, [name]: value });
    };

    const handleSelectCoupon = (coupon) => {
        setReservationData({ ...reservationData, coupon });
    };

    const calculateTotal = () => {
        if (!reservationData.menu) return 0;
        const base = parseInt(reservationData.menu.price.replace(/[^0-9]/g, ''), 10);
        if (isNaN(base)) return 0;

        const { coupon } = reservationData;
        if (coupon.type === 'percent') {
            return base * ((100 - coupon.amount) / 100);
        } else if (coupon.type === 'fixed') {
            return Math.max(0, base - coupon.amount);
        }
        return base;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    // APIへ予約データをPOST送信
    const sendApiRequest = async (data) => {
        const staffName = data.staff.id.startsWith('any') || data.staff.id === 'none' ? data.staff.name : data.staff.name;
        const couponLabel = data.coupon.id === 'none' ? 'なし' : data.coupon.label;

        const payload = {
            userName: data.userName,
            userPhone: data.userPhone,
            reservationDate: data.date,
            reservationTime: data.time,
            assistantName: staffName,
            menuName: data.menu.name,
            couponName: couponLabel
        };

        try {
            const response = await fetch('https://yoyaku-server.onrender.com/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`送信エラー: ${response.status}`);
            }
        } catch (e) {
            console.error('API Post Error: ', e);
            alert('予約エラー: 通信に失敗しました。時間をおいて再度お試しください。');
            throw e;
        }
    };

    // LINEへ予約完了メッセージを自動送信
    const sendLineMessage = async (data) => {
        const staffName = data.staff.id.startsWith('any') || data.staff.id === 'none' ? data.staff.name : data.staff.name;
        const couponLabel = data.coupon.id === 'none' ? 'なし' : data.coupon.label;

        const message = `【予約リクエスト完了】
担当：${staffName}
日時：${formatDate(data.date)} ${data.time}
メニュー：${data.menu.name}
クーポン：${couponLabel}

ご予約リクエストを承りました！店主からの確認をお待ちください。`;

        if (isLiffReady && liff.isLoggedIn()) {
            try {
                await liff.sendMessages([
                    {
                        type: 'text',
                        text: message
                    }
                ]);
            } catch (e) {
                console.error('LIFF Message Error: ', e);
                throw e;
            }
        }
    };

    const resetReservation = () => {
        setStep(1);
        setReservationData({ menu: null, staff: null, date: '', time: '', coupon: coupons[0], userName: '', userPhone: '' });
        setFilter('all');
    };

    const handleConfirm = async () => {
        try {
            await sendApiRequest(reservationData);

            try {
                // API送信成功後、お客様のトークルームへ内容を送信
                await sendLineMessage(reservationData);
            } catch (messageErr) {
                console.warn('APIは成功しましたが、LINEメッセージ送信に失敗しました', messageErr);
            }

            alert('予約完了：\nご予約内容をLINEメッセージで送信いたしました！');
            resetReservation();
        } catch (error) {
            console.log('Reservation failed.', error);
        }
    };

    return (
        <div className="reservation-container">
            <header className="reservation-header">
                <div className="header-inner">
                    <h1>RESERVATION</h1>
                    <button className="link-shop-btn" onClick={() => navigate('/shop')}>SHOP</button>
                </div>
            </header>

            <div className="reservation-content">
                {/* Step Indicator (4 Steps) */}
                <div className="step-indicator">
                    <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-icon"><Scissors size={18} /></div>
                        <span>メニュー</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-icon"><User size={18} /></div>
                        <span>スタッフ</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-icon"><Calendar size={18} /></div>
                        <span>日時</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                        <div className="step-icon"><Tag size={18} /></div>
                        <span>情報入力</span>
                    </div>
                </div>

                <div className="step-body">
                    {/* Step 1: メニュー選択 */}
                    {step === 1 && (
                        <div className="step-panel fade-in">
                            <h2 className="panel-title">ご希望のメニューを選択</h2>
                            <div className="menu-list">
                                {menus.map(menu => (
                                    <div key={menu.id} className="menu-card" onClick={() => handleSelectMenu(menu)}>
                                        <div>
                                            <h3 className="menu-title">{menu.name}</h3>
                                            <p className="menu-price">{menu.price}</p>
                                        </div>
                                        <div className="menu-time">{menu.time}目安</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: スタッフ選択 */}
                    {step === 2 && (
                        <div className="step-panel fade-in">
                            <div className="panel-header-with-back">
                                <button className="icon-back-btn" onClick={handlePrev}><ChevronLeft size={28} /></button>
                                <h2 className="panel-title mb-0">担当スタッフを選択</h2>
                                <div style={{ width: 28 }}></div>
                            </div>

                            <div className="any-staff-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                <button
                                    className="primary-large-btn"
                                    onClick={() => handleSelectStaff({ id: 'none', name: '指名なし', image: null })}
                                >
                                    指名なしで予約する
                                </button>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button
                                        className="primary-large-btn"
                                        style={{ background: '#7a8c99', flex: 1, fontSize: '1rem', padding: '1rem' }}
                                        onClick={() => handleSelectStaff({ id: 'any_male', name: '男性スタッフ希望', image: null })}
                                    >
                                        男性 (誰でもOK)
                                    </button>
                                    <button
                                        className="primary-large-btn"
                                        style={{ background: '#c27d88', flex: 1, fontSize: '1rem', padding: '1rem' }}
                                        onClick={() => handleSelectStaff({ id: 'any_female', name: '女性スタッフ希望', image: null })}
                                    >
                                        女性 (誰でもOK)
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.05rem', color: '#55', textAlign: 'center', marginBottom: '1rem' }}>特定のスタッフを指名する</h3>
                            <div className="filter-buttons">
                                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全員</button>
                                <button className={`filter-btn ${filter === 'female' ? 'active' : ''}`} onClick={() => setFilter('female')}>女性</button>
                                <button className={`filter-btn ${filter === 'male' ? 'active' : ''}`} onClick={() => setFilter('male')}>男性</button>
                            </div>

                            <div className="staff-grid">
                                {filteredStaffs.map(staff => (
                                    <div key={staff.id} className="staff-card" onClick={() => handleSelectStaff(staff)}>
                                        <div className="staff-photo-container">
                                            <img src={staff.image} alt={staff.name} className="staff-photo" />
                                        </div>
                                        <div className="staff-info">
                                            <h3 className="staff-name">{staff.name}</h3>
                                            <div className="staff-tags">
                                                <span className={`tag gender-tag ${staff.gender}`}>{staff.gender === 'male' ? '男性' : '女性'}</span>
                                                <span className="tag">{staff.age}歳</span>
                                                <span className="tag">歴{staff.experience}</span>
                                            </div>
                                            <p className="staff-specialty">得意: {staff.specialty}</p>
                                            <p className="staff-message">"{staff.message}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: 日時選択 */}
                    {step === 3 && (
                        <div className="step-panel fade-in">
                            <div className="panel-header-with-back">
                                <button className="icon-back-btn" onClick={handlePrev}><ChevronLeft size={28} /></button>
                                <h2 className="panel-title mb-0">ご来店日時を選択</h2>
                                <div style={{ width: 28 }}></div>
                            </div>

                            <div className="selected-summary">
                                <div className="summary-row">
                                    <span className="summary-label">メニュー</span>
                                    <span className="summary-name">{reservationData.menu?.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">担当スタッフ</span>
                                    <span className="summary-name">{reservationData.staff?.name}</span>
                                </div>
                            </div>

                            <TimeSlotCalendar onSelectDateTime={handleSelectDateTime} />
                        </div>
                    )}

                    {/* Step 4: クーポン ＆ 情報入力 */}
                    {step === 4 && (
                        <div className="step-panel fade-in">
                            <div className="panel-header-with-back">
                                <button className="icon-back-btn" onClick={handlePrev}><ChevronLeft size={28} /></button>
                                <h2 className="panel-title mb-0">お客様情報・クーポン</h2>
                                <div style={{ width: 28 }}></div>
                            </div>

                            <h3 style={{ fontSize: '1.05rem', color: '#3a322b', marginBottom: '1rem' }}>クーポンの選択</h3>
                            <div className="coupon-selector">
                                {coupons.map(c => (
                                    <div
                                        key={c.id}
                                        className={`coupon-card ${reservationData.coupon.id === c.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectCoupon(c)}
                                    >
                                        <div className="radio-icon"></div>
                                        <span style={{ fontWeight: '500', color: '#333' }}>{c.label}</span>
                                    </div>
                                ))}
                            </div>

                            {reservationData.coupon.id !== 'none' && (
                                <div className="promotion-badge">
                                    クーポン適用中：お得になります！
                                </div>
                            )}

                            <div className="price-breakdown">
                                <div className="price-row">
                                    <span>通常料金</span>
                                    <span>{reservationData.menu?.price}</span>
                                </div>
                                {reservationData.coupon.id !== 'none' && (
                                    <div className="price-row" style={{ color: '#c5a059' }}>
                                        <span>割引適用</span>
                                        <span>-{reservationData.coupon.type === 'percent' ? `${reservationData.coupon.amount}%` : `¥${reservationData.coupon.amount.toLocaleString()}`}</span>
                                    </div>
                                )}
                                <div className="price-row total">
                                    <span>お支払い予定額</span>
                                    <span>¥{calculateTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="input-form mb-4">
                                <div className="form-group">
                                    <label>お名前</label>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={reservationData.userName}
                                        onChange={handleInputChange}
                                        placeholder="例：山田 花子"
                                        className="large-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>電話番号</label>
                                    <input
                                        type="tel"
                                        name="userPhone"
                                        value={reservationData.userPhone}
                                        onChange={handleInputChange}
                                        placeholder="例：090-1234-5678"
                                        className="large-input"
                                    />
                                </div>
                            </div>

                            <button
                                className="primary-large-btn"
                                onClick={handleConfirm}
                                disabled={!reservationData.userName || !reservationData.userPhone}
                            >
                                予約を確定する
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reservation;
