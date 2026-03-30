import React, { useState, useEffect } from 'react';
import './TimeSlotCalendar.css';

const TimeSlotCalendar = ({ onSelectDateTime }) => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 365); // 1年先まで

    const formatDateInput = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDateStr, setSelectedDateStr] = useState(formatDateInput(today));
    const [timeSlots, setTimeSlots] = useState([]);

    useEffect(() => {
        const generateTimeSlots = (dateStr) => {
            const slots = [];
            const isToday = dateStr === formatDateInput(new Date());
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // 10:00 〜 19:00 の30分刻みに変更
            for (let h = 10; h <= 19; h++) {
                for (let m of [0, 30]) {
                    if (h === 19 && m === 30) continue; // 19:00 まで

                    const timeString = `${h}:${m === 0 ? '00' : '30'}`;

                    let isPast = false;
                    if (isToday) {
                        if (h < currentHour) isPast = true;
                        else if (h === currentHour && m <= currentMinute) isPast = true;
                    }

                    // デモ用の予約制限
                    const isAvailable = !isPast && !(h === 13 && m === 30) && !(h === 16 && m === 0);

                    slots.push({ time: timeString, available: isAvailable });
                }
            }
            return slots;
        };

        setTimeSlots(generateTimeSlots(selectedDateStr));
    }, [selectedDateStr]);

    const handleDateChange = (e) => {
        const inputStr = e.target.value;
        if (!inputStr) return;

        const selected = new Date(inputStr);
        const todayZero = new Date();
        todayZero.setHours(0, 0, 0, 0);

        if (selected >= todayZero && selected <= maxDate) {
            setSelectedDateStr(inputStr);
        } else {
            setSelectedDateStr(formatDateInput(today));
        }
    };

    const moveDay = (days) => {
        const current = new Date(selectedDateStr);
        current.setDate(current.getDate() + days);
        const todayZero = new Date();
        todayZero.setHours(0, 0, 0, 0);
        if (current >= todayZero && current <= maxDate) {
            setSelectedDateStr(formatDateInput(current));
        }
    };

    return (
        <div className="calendar-container">
            <div className="date-picker-section">
                <label className="date-label">ご希望の日付</label>
                <div className="date-nav-wrapper">
                    <button className="date-nav-btn" onClick={() => moveDay(-1)}>&lt;</button>
                    <input
                        type="date"
                        className="date-input"
                        value={selectedDateStr}
                        min={formatDateInput(today)}
                        max={formatDateInput(maxDate)}
                        onChange={handleDateChange}
                    />
                    <button className="date-nav-btn" onClick={() => moveDay(1)}>&gt;</button>
                </div>
            </div>

            <h3 className="calendar-date-title">時間を選択</h3>
            <div className="calendar-grid">
                {timeSlots.map((slot, index) => (
                    <button
                        key={index}
                        className={`calendar-slot ${slot.available ? 'available' : 'unavailable'}`}
                        disabled={!slot.available}
                        onClick={() => slot.available && onSelectDateTime(selectedDateStr, slot.time)}
                    >
                        <span className="slot-time">{slot.time}</span>
                        <span className="slot-status">
                            {slot.available ? (
                                <span className="status-circle">⭕</span>
                            ) : (
                                <span className="status-cross">❌</span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TimeSlotCalendar;
