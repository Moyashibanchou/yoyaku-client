import React, { useState, useEffect } from 'react';
import axios from 'axios';
import liff from '@line/liff';
import { Calendar, User, Scissors, Ticket, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { format, addDays, startOfToday, addHours, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import './App.css';

import TimeSlotCalendar from './components/TimeSlotCalendar';

const API_BASE_URL = 'https://yoyaku-server.onrender.com/api';
const RESERVATION_API_URL = 'https://yoyaku-server.onrender.com/api/reservations';

function staffKeyFromSelection(selectedStaff) {
  if (!selectedStaff) return 'none';
  if (selectedStaff.id === 'none' || selectedStaff.id === 'male' || selectedStaff.id === 'female') {
    return selectedStaff.id;
  }
  return String(selectedStaff.id);
}

function staffLabelForKey(key, staffs) {
  if (key === 'none') return '指名なし';
  if (key === 'male') return '男性希望';
  if (key === 'female') return '女性希望';
  const st = staffs.find((s) => String(s.id) === key);
  return st ? st.name : key;
}

function App() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState({ date: null, time: null });
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  const [liffProfile, setLiffProfile] = useState(null);
  const [liffUserId, setLiffUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [formStaffKey, setFormStaffKey] = useState('none');
  const [formUseCoupon, setFormUseCoupon] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: '2009587376-SnE3T7WY' });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setLiffProfile(profile);
          setLiffUserId(profile.userId); // ここでuserIdをstateに保存
          setUserInfo(prev => ({ ...prev, name: profile.displayName }));
        } else {
          liff.login();
        }
      } catch (err) {
        console.warn('LIFF Initialization failed. Using mock profile for demo.', err);
        const mockProfile = {
          displayName: 'LINE太郎',
          pictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          userId: 'U_MOCK_1234567890' // モック用のID
        };
        setLiffProfile(mockProfile);
        setLiffUserId(mockProfile.userId); // モックIDをstateに保存
        setUserInfo(prev => ({ ...prev, name: mockProfile.displayName }));
      }
    };
    initLiff();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // フォールバック用のモックデータ
      const mockServices = [
        { id: 1, name: "カット", durationMin: 60, price: 5500 },
        { id: 2, name: "カット + カラー", durationMin: 120, price: 11000 },
        { id: 3, name: "カット + パーマ", durationMin: 150, price: 12000 },
        { id: 4, name: "トリートメント", durationMin: 30, price: 3000 }
      ];
      
      const mockStaffs = [
        { id: 1, name: "佐藤 太郎 (店長)", gender: '女性', age: '28歳', experience: '6年', specialty: 'ショートボブ・透明感カラー', message: 'お客様一人一人の髪質に合わせたスタイルをご提案します！', photo: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=150&h=150&fit=crop' },
        { id: 2, name: "田中 花子 (トップスタイリスト)", gender: '男性', age: '35歳', experience: '12年', specialty: 'メンズカット・パーマ', message: '再現性の高いカットに自信があります。何でもご相談ください。', photo: 'https://images.unsplash.com/photo-1583196311067-484528a6f8e4?w=150&h=150&fit=crop' },
        { id: 3, name: "鈴木 一郎 (スタイリスト)", gender: '女性', age: '31歳', experience: '9年', specialty: 'デザインカラー・縮毛矯正', message: '丁寧なカウンセリングで、理想のカラーを叶えます。', photo: 'https://images.unsplash.com/photo-1607746822051-ad552fd60ce9?w=150&h=150&fit=crop' }
      ];

      const mockCoupons = [
        { id: 1, title: "【新規限定】全メニュー500円OFF", discountText: "初回ご来店の方限定で500円割引いたします。" },
        { id: 2, title: "平日限定！トリートメント無料券", discountText: "平日にご予約いただくとトリートメントをサービスいたします。" },
        { id: 3, title: "次回使えるリピート割", discountText: "2ヶ月以内の再来店で10%OFFになります。" }
      ];

      try {
        const [servicesRes, staffsRes, couponsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/master/services`),
          axios.get(`${API_BASE_URL}/master/staffs`),
          axios.get(`${API_BASE_URL}/master/coupons`)
        ]);
        
        // APIから取得したスタッフデータをリッチ化
        const enrichedStaffs = staffsRes.data.map((staff, index) => {
          const details = [
            { gender: '女性', age: '28歳', experience: '6年', specialty: 'ショートボブ・透明感カラー', message: 'お客様一人一人の髪質に合わせたスタイルをご提案します！', photo: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=150&h=150&fit=crop' },
            { gender: '男性', age: '35歳', experience: '12年', specialty: 'メンズカット・パーマ', message: '再現性の高いカットに自信があります。何でもご相談ください。', photo: 'https://images.unsplash.com/photo-1583196311067-484528a6f8e4?w=150&h=150&fit=crop' },
            { gender: '女性', age: '31歳', experience: '9年', specialty: 'デザインカラー・縮毛矯正', message: '丁寧なカウンセリングで、理想のカラーを叶えます。', photo: 'https://images.unsplash.com/photo-1607746822051-ad552fd60ce9?w=150&h=150&fit=crop' }
          ];
          return { ...staff, ...details[index % details.length] };
        });

        setServices(servicesRes.data);
        setStaffs(enrichedStaffs);
        setCoupons(couponsRes.data);
      } catch (error) {
        console.warn('API connection failed. Using fallback mock data for demo.', error);
        setServices(mockServices);
        setStaffs(mockStaffs);
        setCoupons(mockCoupons);
      }
    };
    fetchData();
  }, []);

  const handleDateTimeSelect = (date, time) => {
    setSelectedDateTime({ date, time });
  };

  const goToCustomerStep = () => {
    setFormStaffKey(staffKeyFromSelection(selectedStaff));
    setFormUseCoupon(!!selectedCoupon);
    setStep(3);
  };

  const handleReservation = async () => {
    const userId = (liffUserId || '').trim();
    if (!userId || !userId.startsWith('U')) {
      alert('エラー: 有効なLINE userId（Uから始まるID）が取得できていません');
      return;
    }

    setLoading(true);

    try {
      const dateTime = `${format(selectedDateTime.date, 'yyyy-MM-dd')}T${selectedDateTime.time}:00`;
      const staff = staffLabelForKey(formStaffKey, staffs);
      const useCoupon = formUseCoupon;

      const response = await fetch(RESERVATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          menu: selectedService.name,
          dateTime,
          staff,
          useCoupon
        })
      });

      if (response.ok) {
        setLoading(false);
        setReservationComplete(true);
        setStep(3);
        return;
      }

      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status} ${response.statusText}${errorBody ? `: ${errorBody}` : ''}`);
    } catch (error) {
      console.error('Reservation request failed:', error);
      setLoading(false);
      alert(`予約の送信に失敗しました: ${error.message}`);
    }
  };

  const timeSlots = [];
  for (let i = 10; i <= 19; i++) {
    timeSlots.push(`${i}:00`);
    timeSlots.push(`${i}:30`);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <h2 className="step-title"><Scissors size={20} /> メニュー選択</h2>
            <div className="list-container">
              {services.map(s => (
                <div 
                  key={s.id} 
                  className={`list-item ${selectedService?.id === s.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(s)}
                >
                  <div className="item-info">
                    <span className="item-name">{s.name}</span>
                    <span className="item-sub">{s.durationMin}分 / ¥{s.price.toLocaleString()}</span>
                  </div>
                  {selectedService?.id === s.id && <CheckCircle className="check-icon" size={20} />}
                </div>
              ))}
            </div>

            <h2 className="step-title mt-4"><User size={20} /> スタッフ選択</h2>
            <div className="staff-selection-container">
              {/* 特別な選択肢 */}
              <div className="special-options">
                {[
                  { id: 'none', name: '指名なし', icon: '👤' },
                  { id: 'male', name: '男性希望', icon: '👔' },
                  { id: 'female', name: '女性希望', icon: '👗' }
                ].map(opt => (
                  <div 
                    key={opt.id} 
                    className={`special-option-card ${selectedStaff?.id === opt.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(opt)}
                  >
                    <span className="opt-icon">{opt.icon}</span>
                    <span className="opt-name">{opt.name}</span>
                  </div>
                ))}
              </div>

              {/* 個別スタッフ一覧 */}
              <div className="staff-list">
                {staffs.map(st => (
                  <div 
                    key={st.id} 
                    className={`staff-profile-card ${selectedStaff?.id === st.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(st)}
                  >
                    <div className="staff-photo">
                      <img src={st.photo} alt={st.name} />
                    </div>
                    <div className="staff-details">
                      <div className="staff-header">
                        <span className="staff-name-large">{st.name.split(' ')[0]}</span>
                        <span className="staff-meta">{st.gender} / {st.age} / 歴{st.experience}</span>
                      </div>
                      <div className="staff-specialty">得意: {st.specialty}</div>
                      <div className="staff-message">"{st.message}"</div>
                    </div>
                    {selectedStaff?.id === st.id && <div className="selected-badge"><CheckCircle size={16} /></div>}
                  </div>
                ))}
              </div>
            </div>

            <h2 className="step-title mt-4"><Ticket size={20} /> クーポン利用</h2>
            <div className="list-container">
              <div 
                className={`list-item coupon-item ${!selectedCoupon ? 'selected' : ''}`}
                onClick={() => setSelectedCoupon(null)}
              >
                <span>利用しない</span>
              </div>
              {coupons.map(c => (
                <div 
                  key={c.id} 
                  className={`list-item coupon-item highlight ${selectedCoupon?.id === c.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCoupon(c)}
                >
                  <div className="item-info">
                    <span className="item-name">{c.title}</span>
                    <span className="item-sub">{c.discountText}</span>
                  </div>
                  {selectedCoupon?.id === c.id && <CheckCircle className="check-icon" size={20} />}
                </div>
              ))}
            </div>

            <button 
              className="next-button" 
              disabled={!selectedService || !selectedStaff}
              onClick={() => setStep(2)}
            >
              日時を選択する <ChevronRight size={18} />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="step-container">
            <h2 className="step-title"><Calendar size={20} /> 日時選択</h2>
            <TimeSlotCalendar 
              selectedStaff={selectedStaff}
              onDateTimeSelect={handleDateTimeSelect} 
            />
            {selectedDateTime.time && (
              <div className="selected-datetime">
                選択中の日時: {format(selectedDateTime.date, 'M月d日')} {selectedDateTime.time}
              </div>
            )}
            <div className="button-group mt-6">
              <button className="back-button" onClick={() => setStep(1)}>
                <ChevronLeft size={18} /> 戻る
              </button>
              <button 
                className="next-button" 
                disabled={!selectedDateTime.time}
                onClick={goToCustomerStep}
              >
                お客様情報へ <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );
      case 3:
        if (reservationComplete) {
          return (
            <div className="complete-container">
              <div className="success-icon">
                <CheckCircle size={80} color="#4CAF50" />
              </div>
              <h2>予約が完了しました！</h2>
              <p>ご来店をお待ちしております。</p>
              <div className="summary-card mt-6">
                <p><span>日時:</span> {format(selectedDateTime.date, 'yyyy/MM/dd')} {selectedDateTime.time}</p>
                <p><span>メニュー:</span> {selectedService.name}</p>
              </div>
              <button className="next-button mt-8" onClick={() => window.location.reload()}>
                トップへ戻る
              </button>
            </div>
          );
        }

        return (
          <div className="step-container">
            <h2 className="step-title">お客様情報入力</h2>
            
            {liffProfile && (
              <div className="liff-profile-banner">
                <img src={liffProfile.pictureUrl} alt="LINE Profile" className="liff-avatar" />
                <div className="liff-info">
                  <span className="liff-welcome">こんにちは、{liffProfile.displayName}さん</span>
                  <span className="liff-desc">LINEアカウント情報で予約を進めています</span>
                </div>
              </div>
            )}

            <div className="form-group mt-4">
              <label>お名前</label>
              <input 
                type="text" 
                placeholder="山田 太郎"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>電話番号</label>
              <input 
                type="tel" 
                placeholder="09012345678"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reservation-staff">担当者</label>
              <select
                id="reservation-staff"
                className="form-select"
                value={formStaffKey}
                onChange={(e) => setFormStaffKey(e.target.value)}
              >
                <option value="none">指名なし</option>
                <option value="male">男性希望</option>
                <option value="female">女性希望</option>
                {staffs.map((st) => (
                  <option key={st.id} value={String(st.id)}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <span className="form-group-label">クーポンの利用</span>
              <div className="radio-row">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="useCoupon"
                    checked={!formUseCoupon}
                    onChange={() => setFormUseCoupon(false)}
                  />
                  利用しない
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="useCoupon"
                    checked={formUseCoupon}
                    onChange={() => setFormUseCoupon(true)}
                  />
                  利用する
                </label>
              </div>
            </div>

            <div className="summary-card mt-6">
              <h3>予約内容の確認</h3>
              <p><span>メニュー:</span> {selectedService.name}</p>
              <p><span>担当:</span> {staffLabelForKey(formStaffKey, staffs)}</p>
              <p><span>日時:</span> {format(selectedDateTime.date, 'yyyy/MM/dd')} {selectedDateTime.time}</p>
              {formUseCoupon && selectedCoupon && (
                <p className="coupon-text"><span>クーポン:</span> {selectedCoupon.title}</p>
              )}
              {formUseCoupon && !selectedCoupon && (
                <p className="coupon-text"><span>クーポン:</span> 種別はステップ1で選択してください</p>
              )}
              {!formUseCoupon && <p><span>クーポン:</span> 利用しない</p>}
              <p className="price"><span>合計金額:</span> ¥{selectedService.price.toLocaleString()}</p>
            </div>

            <div className="button-group mt-6">
              <button className="back-button" onClick={() => setStep(2)}>
                <ChevronLeft size={18} /> 戻る
              </button>
              <button 
                type="button"
                className="confirm-button" 
                disabled={!userInfo.name || !userInfo.phone || loading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleReservation();
                }}
              >
                {loading ? '送信中...' : '予約を確定する'}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="complete-container">
            <div className="success-icon">
              <CheckCircle size={80} color="#4CAF50" />
            </div>
            <h2>予約が完了しました！</h2>
            <p>ご来店をお待ちしております。</p>
            <div className="summary-card mt-6">
              <p><span>日時:</span> {format(selectedDateTime.date, 'yyyy/MM/dd')} {selectedDateTime.time}</p>
              <p><span>メニュー:</span> {selectedService.name}</p>
            </div>
            <button className="next-button mt-8" onClick={() => window.location.reload()}>
              トップへ戻る
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SALON DEMO</h1>
        <div className="progress-bar">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="progress-line"></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="progress-line"></div>
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </header>
      <main className="app-main">
        {renderStep()}
      </main>
    </div>
  );
}

export default App;
