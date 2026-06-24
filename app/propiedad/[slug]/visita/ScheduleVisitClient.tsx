"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Property, scheduleVisit } from '@/lib/supabase';
import { formatUF, formatCLP } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/app/components/ui/AlertProvider';

type Props = {
  property: Property;
  clpPrice: number;
  dict: any;
  userId?: string;
};

export default function ScheduleVisitClient({ property, clpPrice, dict, userId }: Props) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const agentAssignment = property.property_assignments?.find((a: any) => a.role_types?.name === 'agente');
  
  const handleConfirm = async () => {
    if (!userId) {
      showAlert("Atención", "Por favor, inicia sesión para programar una visita.", "warning");
      return;
    }
    if (!selectedDate || !selectedTime) {
      showAlert("Atención", "Por favor, selecciona una fecha y hora.", "warning");
      return;
    }

    setIsSubmitting(true);
    
    // selectedDate holds the timestamp, we create a new Date object from it
    const visitDate = new Date(selectedDate);
    // Parse time like "10:00 AM" or "02:30 PM"
    const [timeStr, modifier] = selectedTime.split(' ');
    let [hours, minutes] = timeStr.split(':');
    let hoursNum = parseInt(hours, 10);
    if (modifier === 'PM' && hoursNum < 12) hoursNum += 12;
    if (modifier === 'AM' && hoursNum === 12) hoursNum = 0;
    
    visitDate.setHours(hoursNum, parseInt(minutes, 10), 0, 0);
    
    const success = await scheduleVisit({
      user_id: userId,
      property_id: property.id,
      visit_date: visitDate.toISOString(),
      status: 'scheduled',
      message
    });

    setIsSubmitting(false);

    if (success) {
      showAlert("¡Éxito!", "¡Visita agendada con éxito!", "success");
      router.push('/perfil');
    } else {
      showAlert("Error", "Hubo un error al agendar tu visita.", "error");
    }
  };

  // Generate calendar grid
  const generateCalendar = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    // Monday is 0, Sunday is 6
    let startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const calendarDays = [];
    
    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isSunday = d.getDay() === 0;
      calendarDays.push({
        timestamp: d.getTime(),
        day: i,
        available: d >= today && !isSunday
      });
    }
    
    return calendarDays;
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
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

  const times = generateTimes();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonthYear = `${monthNames[currentMonthDate.getMonth()]} de ${currentMonthDate.getFullYear()}`;

  return (
    <div className="w-full max-w-6xl bg-white dark:bg-[#162e2a] rounded-xl shadow-2xl shadow-mosque/5 overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800">
      {/* Left side: Property Details */}
      <div className="w-full md:w-5/12 bg-slate-50 dark:bg-[#112522] p-6 md:p-8 lg:p-10 flex flex-col gap-6 relative">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-mosque/5 to-transparent pointer-events-none"></div>
        <div className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md aspect-[4/3]">
          <img alt={property.image_alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={property.image_url} />
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-mosque">
            {dict.scheduleVisit?.forSale || "For Sale"}
          </div>
        </div>
        <div className="space-y-4 z-10">
          <div>
            <h2 className="text-2xl font-bold text-nordic dark:text-white leading-tight">{property.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 text-sm">
              <span className="material-icons text-base">location_on</span>
              {property.location}
            </p>
          </div>
          <div className="flex items-center justify-between py-4 border-y border-slate-200 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{dict.scheduleVisit?.price || "Price"}</span>
              <span className="text-xl font-bold text-mosque">{formatUF(property.price)}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
              <div className="flex flex-col items-center">
                <span className="material-icons text-slate-400">bed</span>
                <span className="text-xs font-medium">{property.beds} {dict.filters?.beds || "Beds"}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col items-center">
                <span className="material-icons text-slate-400">shower</span>
                <span className="text-xs font-medium">{property.baths} {dict.filters?.baths || "Baths"}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex flex-col items-center">
                <span className="material-icons text-slate-400">square_foot</span>
                <span className="text-xs font-medium">{property.area} {dict.property?.sqm || "sqm"}</span>
              </div>
            </div>
          </div>
          {agentAssignment?.user_profiles ? (
            <div className="flex items-center gap-3 pt-2">
              <img 
                alt="Agent" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" 
                src={agentAssignment.user_profiles.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(agentAssignment.user_profiles.full_name)} 
              />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Agente Asignado</p>
                <p className="text-nordic dark:text-white font-semibold">{agentAssignment.user_profiles.full_name}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pt-2">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="material-icons text-slate-400">person</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sin Agente Asignado</p>
                <p className="text-nordic dark:text-white font-semibold">Bienes Raíces Lacustre</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full md:w-7/12 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nordic dark:text-white mb-2">{dict.scheduleVisit?.title || "Schedule a Viewing"}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{dict.scheduleVisit?.subtitle || "Choose a date and time to tour the property in person."}</p>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-nordic dark:text-white uppercase tracking-wider">{currentMonthYear}</h3>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-mosque transition-colors">
                  <span className="material-icons text-lg">chevron_left</span>
                </button>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-nordic dark:text-white hover:text-mosque transition-colors">
                  <span className="material-icons text-lg">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-xs font-medium text-slate-400 py-1">{day}</div>
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
                        !d.available ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400' :
                        selectedDate === d.timestamp 
                          ? 'bg-mosque text-white font-bold shadow-md transform scale-105 border-transparent' 
                          : 'text-nordic dark:text-white hover:bg-mosque/10 border border-transparent hover:border-mosque/30'
                      }`}
                    >
                      {d.day}
                    </button>
                  ) : (
                    <div className="w-full h-full rounded-lg"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-nordic dark:text-white uppercase tracking-wider mb-4">{dict.scheduleVisit?.availableTimes || "Available Times"}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar-y pr-2">
              {times.map((t) => (
                <button 
                  key={t.time}
                  onClick={() => t.available && setSelectedTime(t.time)}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    !t.available 
                      ? 'border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50 decoration-slate-400 line-through'
                      : selectedTime === t.time 
                        ? 'bg-mosque/10 border border-mosque text-mosque font-medium shadow-sm'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-mosque hover:text-mosque'
                  }`}
                >
                  {t.time}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-semibold text-nordic dark:text-white uppercase tracking-wider" htmlFor="message">
                {dict.scheduleVisit?.message || "Message for the agent"} <span className="text-slate-400 font-normal normal-case ml-1">{dict.scheduleVisit?.optional || "(Optional)"}</span>
              </label>
              <span className={`text-xs font-medium ${message.length >= 250 ? 'text-red-500' : 'text-slate-400'}`}>
                {message.length} / 250
              </span>
            </div>
            <textarea 
              id="message" 
              rows={3}
              maxLength={250}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dict.scheduleVisit?.placeholder || "¿Alguna pregunta o requerimiento específico?"}
              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112522] text-nordic dark:text-slate-200 placeholder:text-slate-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-shadow resize-none text-sm"
            ></textarea>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-4">
          <Link href={`/propiedad/${property.slug}`} className="text-slate-500 dark:text-slate-400 hover:text-nordic dark:hover:text-white font-medium px-4 py-2 text-sm transition-colors">
            {dict.scheduleVisit?.cancel || "Cancel"}
          </Link>
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-mosque hover:bg-mosque-dark disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-mosque/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2"
          >
            <span>{isSubmitting ? "Enviando..." : (dict.scheduleVisit?.confirm || "Confirm Visit")}</span>
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
