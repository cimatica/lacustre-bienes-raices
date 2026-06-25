'use client';

import React, { useState } from 'react';

type RescheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: Date) => void;
  isSubmitting: boolean;
};

export default function RescheduleModal({ isOpen, onClose, onConfirm, isSubmitting }: RescheduleModalProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    const visitDate = new Date(selectedDate);
    const [timeStr, modifier] = selectedTime.split(' ');
    let [hours, minutes] = timeStr.split(':');
    let hoursNum = parseInt(hours, 10);
    if (modifier === 'PM' && hoursNum < 12) hoursNum += 12;
    if (modifier === 'AM' && hoursNum === 12) hoursNum = 0;
    visitDate.setHours(hoursNum, parseInt(minutes, 10), 0, 0);

    onConfirm(visitDate);
  };

  const generateCalendar = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    let startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isSunday = d.getDay() === 0;
      calendarDays.push({ timestamp: d.getTime(), day: i, available: d >= today && !isSunday });
    }
    return calendarDays;
  };

  const generateTimes = () => {
    const timeSlots = [];
    for (let h = 9; h <= 19; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h > 12 ? h - 12 : h;
      timeSlots.push({ time: `${hr.toString().padStart(2, '0')}:00 ${ampm}`, available: true });
      timeSlots.push({ time: `${hr.toString().padStart(2, '0')}:30 ${ampm}`, available: true });
    }
    timeSlots.push({ time: `08:00 PM`, available: true });
    return timeSlots;
  };

  const handlePrevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

  const times = generateTimes();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonthYear = `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <span className="material-icons">close</span>
        </button>
        <h2 className="text-xl font-bold text-[#19322F] mb-6">Reprogramar Visita</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#19322F] uppercase tracking-wider">{currentMonthYear}</h3>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <span className="material-icons text-lg">chevron_left</span>
              </button>
              <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 text-[#19322F] transition-colors">
                <span className="material-icons text-lg">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((d, i) => (
              <div key={i} className="aspect-square flex items-center justify-center p-1">
                {d ? (
                  <button 
                    disabled={!d.available}
                    onClick={() => d.available && setSelectedDate(d.timestamp)}
                    className={`w-full h-full flex items-center justify-center rounded-lg transition-all text-sm ${
                      !d.available ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' :
                      selectedDate === d.timestamp 
                        ? 'bg-[#006655] text-white font-bold shadow-md transform scale-105' 
                        : 'text-[#19322F] hover:bg-[#006655]/10 border border-transparent hover:border-[#006655]/30'
                    }`}
                  >
                    {d.day}
                  </button>
                ) : <div className="w-full h-full"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[#19322F] uppercase tracking-wider mb-4">Horarios</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar-y pr-2">
            {times.map((t) => (
              <button 
                key={t.time}
                onClick={() => t.available && setSelectedTime(t.time)}
                className={`py-1.5 px-2 rounded-lg text-[13px] transition-all ${
                  !t.available 
                    ? 'border border-gray-200 text-gray-300 cursor-not-allowed opacity-50 decoration-gray-400 line-through'
                    : selectedTime === t.time 
                      ? 'bg-[#006655]/10 border border-[#006655] text-[#006655] font-medium shadow-sm'
                      : 'border border-gray-200 text-gray-500 hover:border-[#006655] hover:text-[#006655]'
                }`}
              >
                {t.time}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="px-6 py-2 text-sm font-medium bg-[#006655] hover:bg-[#004d40] text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <span className="material-icons animate-spin text-[16px]">refresh</span> : null}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
