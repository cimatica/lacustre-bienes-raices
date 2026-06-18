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
  const [selectedDate, setSelectedDate] = useState<number | null>(8);
  const [selectedTime, setSelectedTime] = useState<string | null>("10:00 AM");
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Dummy date calculation logic for the UI prototype
    const visitDate = new Date();
    visitDate.setDate(selectedDate);
    
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

  const dates = [
    { day: 1, available: true }, { day: 2, available: true }, { day: 3, available: true },
    { day: 4, available: true }, { day: 5, available: true }, { day: 6, available: true },
    { day: 7, available: true }, { day: 8, available: true }, { day: 9, available: true },
    { day: 10, available: true }, { day: 11, available: true }
  ];

  const times = [
    { time: "09:00 AM", available: true }, { time: "09:30 AM", available: true },
    { time: "10:00 AM", available: true }, { time: "10:30 AM", available: true },
    { time: "11:30 AM", available: true }, { time: "01:00 PM", available: false },
    { time: "02:00 PM", available: true }, { time: "03:30 PM", available: true }
  ];

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
          <div className="flex items-center gap-3 pt-2">
            <img alt="Agent" className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjW8nnOPHp1gOZTOS7qhMHvipD0b7viW3jmd_eAxFO7faa8rI-l2bjqTkw5xsGNAAnbxLfoLrJwf86iz_rvrcWZ1PFCBbsJs6F9fVADumsgd1pH2AorRGRV9YWFsvenDLX89W1nX6Lmk8xN6BS-BGAypyNgxlEtcnDxTSovjH9JsrUcwKHPTLVfJpIjQE_c2pIKScAf2WlFi5sf861r5TKZaownHpiub2sbluHlfsR2sZFQCxs5Lgy6J78tn3e1OQ_hBGy1V0_ueE" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{dict.scheduleVisit?.hostedBy || "Hosted by"}</p>
              <p className="text-nordic dark:text-white font-semibold">Sarah Jenkins</p>
            </div>
            <button className="ml-auto p-2 text-mosque hover:bg-mosque/10 rounded-full transition-colors" title={dict.property?.contactAgent || "Contact Agent"}>
              <span className="material-icons">chat_bubble_outline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full md:w-7/12 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nordic dark:text-white mb-2">{dict.scheduleVisit?.title || "Schedule a Viewing"}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{dict.scheduleVisit?.subtitle || "Choose a date and time to tour the property in person."}</p>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-nordic dark:text-white uppercase tracking-wider">October 2023</h3>
              <div className="flex gap-1">
                <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-mosque transition-colors">
                  <span className="material-icons text-lg">chevron_left</span>
                </button>
                <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-nordic dark:text-white hover:text-mosque transition-colors">
                  <span className="material-icons text-lg">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center mb-6">
              <div className="text-xs font-medium text-slate-400 py-2">Mon</div>
              <div className="text-xs font-medium text-slate-400 py-2">Tue</div>
              <div className="text-xs font-medium text-slate-400 py-2">Wed</div>
              <div className="text-xs font-medium text-slate-400 py-2">Thu</div>
              <div className="text-xs font-medium text-slate-400 py-2">Fri</div>
              <div className="text-xs font-medium text-slate-400 py-2">Sat</div>
              <div className="text-xs font-medium text-slate-400 py-2">Sun</div>
              <button className="text-sm text-slate-300 dark:text-slate-600 py-2 rounded-lg cursor-not-allowed">28</button>
              <button className="text-sm text-slate-300 dark:text-slate-600 py-2 rounded-lg cursor-not-allowed">29</button>
              <button className="text-sm text-slate-300 dark:text-slate-600 py-2 rounded-lg cursor-not-allowed">30</button>
              {dates.map((d) => (
                <button 
                  key={d.day}
                  onClick={() => setSelectedDate(d.day)}
                  className={`text-sm py-2 rounded-lg transition-colors ${
                    selectedDate === d.day 
                      ? 'relative bg-mosque text-white font-semibold shadow-lg shadow-mosque/30 transform scale-105' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {d.day}
                  {selectedDate === d.day && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-nordic dark:text-white uppercase tracking-wider mb-4">{dict.scheduleVisit?.availableTimes || "Available Times"}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
            <label className="block text-sm font-semibold text-nordic dark:text-white uppercase tracking-wider mb-2" htmlFor="message">
              {dict.scheduleVisit?.message || "Message for the agent"} <span className="text-slate-400 font-normal normal-case ml-1">{dict.scheduleVisit?.optional || "(Optional)"}</span>
            </label>
            <textarea 
              id="message" 
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dict.scheduleVisit?.placeholder || "Any specific questions or requests?"}
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
