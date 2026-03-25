import React, { useState, useMemo } from 'react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

const TimeSlotCalendar = ({ selectedStaff, onDateTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 10; i <= 19; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  }, []);

  const availability = useMemo(() => {
    const av = {};
    const today = startOfToday();
    
    // スタッフIDを数値に変換（'none', 'male', 'female'などの文字列対策）
    const staffIdNum = typeof selectedStaff?.id === 'number' 
      ? selectedStaff.id 
      : (selectedStaff?.id === 'none' ? 100 : (selectedStaff?.id === 'male' ? 200 : 300));

    for (let d = 0; d < 7; d++) {
      const date = addDays(today, d);
      const dateStr = format(date, 'yyyy-MM-dd');
      av[dateStr] = {};
      timeSlots.forEach(time => {
        // ダミーの空き状況を生成
        const hash = staffIdNum + date.getDate() + parseInt(time.replace(':', ''));
        const random = Math.sin(hash) * 10000;
        const statusValue = Math.abs(random - Math.floor(random));

        if (statusValue < 0.8) av[dateStr][time] = '〇'; // 予約可（デモ用に多めに設定）
        else av[dateStr][time] = '×'; // 予約不可
      });
    }
    return av;
  }, [selectedStaff, timeSlots]);

  const dates = [...Array(7)].map((_, i) => addDays(startOfToday(), i));

  return (
    <div className="timeslot-calendar">
      <div className="date-tabs">
        {dates.map(date => (
          <div 
            key={format(date, 'yyyy-MM-dd')}
            className={`date-tab ${isSameDay(selectedDate, date) ? 'active' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <span className="day-name">{format(date, 'E', { locale: ja })}</span>
            <span className="day-number">{format(date, 'd')}</span>
          </div>
        ))}
      </div>

      <div className="timeslot-grid">
        <div className="time-labels">
          {timeSlots.map(time => time.endsWith(':00') && <div key={time} className="time-label">{time}</div>)}
        </div>
        <div className="time-cells">
          {timeSlots.map(time => {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const status = availability[dateStr]?.[time] || '×';
            const isSelectable = status === '〇';
            return (
              <div 
                key={time}
                className={`time-cell status-${status} ${isSelectable ? 'selectable' : ''}`}
                onClick={() => isSelectable && onDateTimeSelect(selectedDate, time)}
              >
                {status}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotCalendar;
