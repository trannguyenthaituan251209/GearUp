import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS_IN_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function AssetCalendar({ activeBookings = [], startDate, endDate, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth();
    if (!isCurrentMonth) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const getDateBookingStatus = (dateToCheck) => {
    // Normalize time for checking
    const checkTime = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate()).getTime();
    
    const booking = activeBookings.find(b => {
      const start = new Date(b.startDate);
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const end = new Date(b.endDate);
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      return checkTime >= startTime && checkTime <= endTime;
    });
    return booking ? booking.status : false;
  };

  const isDatePast = (dateToCheck) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const isDateSelected = (dateToCheck) => {
    const checkTime = dateToCheck.getTime();
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      if (checkTime === s.getTime()) return 'start';
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(0, 0, 0, 0);
      if (checkTime === e.getTime()) return 'end';
    }
    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(0, 0, 0, 0);
      if (checkTime > s.getTime() && checkTime < e.getTime()) return 'in-between';
    }
    return false;
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (isDatePast(clickedDate) || getDateBookingStatus(clickedDate)) return;

    const clickedDateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;

    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      onDateSelect(clickedDateStr, '');
    } else if (startDate && !endDate) {
      // Select end date
      const sDate = new Date(startDate);
      if (clickedDate < sDate) {
        onDateSelect(clickedDateStr, ''); // Reset start date if selected earlier date
      } else {
        // Check if there are any booked dates in between
        let hasBookedInBetween = false;
        let tempDate = new Date(sDate);
        while (tempDate <= clickedDate) {
          if (getDateBookingStatus(tempDate)) {
            hasBookedInBetween = true;
            break;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
        
        if (hasBookedInBetween) {
          alert("Khoảng thời gian bạn chọn chứa những ngày đã bị kín lịch. Vui lòng chọn lại!");
          onDateSelect('', '');
        } else {
          onDateSelect(startDate, clickedDateStr);
        }
      }
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    return (
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            type="button"
            onClick={prevMonth} 
            disabled={isCurrentMonth}
            style={{ background: 'none', border: 'none', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', color: isCurrentMonth ? '#cbd5e1' : 'var(--color-dark)', padding: '4px' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-dark)' }}>
            Tháng {month + 1}, {year}
          </div>
          <button 
            type="button"
            onClick={nextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-dark)', padding: '4px' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {DAYS_IN_WEEK.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {blanks.map((_, i) => <div key={`blank-${i}`} />)}
          {days.map(day => {
            const dateObj = new Date(year, month, day);
            const isPast = isDatePast(dateObj);
            const bookingStatus = getDateBookingStatus(dateObj);
            const selectedStatus = isDateSelected(dateObj);
            
            let bg = 'transparent';
            let color = 'var(--color-dark)';
            let isClickable = true;

            if (isPast) {
              color = '#cbd5e1';
              isClickable = false;
            } else if (bookingStatus === 'blocked') {
              bg = '#f1f5f9'; // light gray
              color = '#64748b'; // slate gray
              isClickable = false;
            } else if (bookingStatus) {
              bg = '#fecaca'; // light red
              color = '#991b1b'; // dark red
              isClickable = false;
            } else if (selectedStatus === 'start' || selectedStatus === 'end') {
              bg = 'var(--color-primary)';
              color = '#fff';
            } else if (selectedStatus === 'in-between') {
              bg = '#dbeafe'; // light blue
              color = 'var(--color-primary)';
            }

            return (
              <div 
                key={day} 
                onClick={() => isClickable ? handleDayClick(day) : null}
                style={{ 
                  aspectRatio: '1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '13px', 
                  fontWeight: selectedStatus ? '700' : '500',
                  backgroundColor: bg,
                  color: color,
                  borderRadius: selectedStatus === 'in-between' ? '0' : '8px',
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  textDecoration: bookingStatus ? 'line-through' : 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#fff', border: '1px solid var(--color-border)' }} /> Trống
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#fecaca' }} /> Đã thuê
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }} /> Không khả dụng
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--color-primary)' }} /> Đang chọn
          </div>
        </div>
      </div>
    );
  };

  return renderCalendar();
}
