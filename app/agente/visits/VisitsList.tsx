'use client';

import React, { useState } from 'react';
import { updateVisitStatus } from '@/app/agente/actions';
import { useAlert } from '@/app/components/ui/AlertProvider';

type Visit = {
  id: string;
  visit_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  message?: string;
  user_profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  properties: {
    id: string;
    title: string;
    image_url: string | null;
    location: string;
  };
};

export default function VisitsList({ visits }: { visits: Visit[] }) {
  const { showAlert } = useAlert();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (visitId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    setLoadingId(visitId);
    const result = await updateVisitStatus(visitId, newStatus);
    setLoadingId(null);
    
    if (result.error) {
      showAlert('Error', result.error, 'error');
    } else {
      showAlert('Actualizado', 'El estado de la visita ha sido actualizado.', 'success');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'scheduled':
        return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">Agendada</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">Completada</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Cancelada</span>;
      default:
        return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const formatWhatsAppUrl = (phone: string | null) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 9) {
      return `https://wa.me/56${cleanPhone}`;
    }
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {visits.map((visit) => {
        const d = new Date(visit.visit_date);
        const isPast = d < new Date() && visit.status === 'scheduled';

        return (
          <div key={visit.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors">
            
            {/* Fecha y Hora */}
            <div className="col-span-12 md:col-span-2 flex items-center gap-4">
              <div className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border ${isPast ? 'bg-orange-50 border-orange-200 text-orange-700' : visit.status === 'scheduled' ? 'bg-[#EEF6F6] border-[#006655]/20 text-[#006655]' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                <span className="text-[10px] uppercase font-bold">{d.toLocaleString('es', { month: 'short' })}</span>
                <span className="text-xl font-bold leading-none my-0.5">{d.getDate()}</span>
              </div>
              <div>
                <p className={`text-sm font-bold ${isPast ? 'text-orange-700' : 'text-[#19322F]'}`}>
                  {d.toLocaleString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="mt-1">{getStatusBadge(visit.status)}</div>
              </div>
            </div>

            {/* Interesado */}
            <div className="col-span-12 md:col-span-3">
              <p className="text-xs text-gray-500 mb-1 uppercase font-semibold tracking-wider">Interesado</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {visit.user_profiles.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#19322F] truncate">{visit.user_profiles.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {visit.user_profiles.phone ? (
                      <a href={formatWhatsAppUrl(visit.user_profiles.phone) || '#'} target="_blank" className="text-xs text-[#25D366] hover:underline flex items-center gap-1">
                        <span className="material-icons text-[12px]">whatsapp</span>
                        Contactar
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Sin teléfono</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Propiedad y Mensaje */}
            <div className="col-span-12 md:col-span-4">
              <p className="text-xs text-gray-500 mb-1 uppercase font-semibold tracking-wider">Propiedad</p>
              <div className="flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-lg mb-2">
                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-200">
                  {visit.properties.image_url ? (
                    <img src={visit.properties.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-icons text-gray-400 w-full h-full flex items-center justify-center text-xs">image</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#19322F] truncate">{visit.properties.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{visit.properties.location}</p>
                </div>
              </div>
              {visit.message && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 flex gap-2">
                  <span className="material-icons text-orange-500 text-[16px] shrink-0">chat</span>
                  <p className="text-xs text-orange-800 italic break-words line-clamp-2" title={visit.message}>"{visit.message}"</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="col-span-12 md:col-span-3 flex md:justify-end gap-2">
              {visit.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => handleStatusChange(visit.id, 'completed')}
                    disabled={loadingId === visit.id}
                    className="flex-1 md:flex-none px-3 py-2 text-xs font-medium bg-[#006655] hover:bg-[#004d40] text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    {loadingId === visit.id ? <span className="material-icons animate-spin text-[14px]">refresh</span> : <span className="material-icons text-[14px]">check</span>}
                    Completar
                  </button>
                  <button
                    onClick={() => handleStatusChange(visit.id, 'cancelled')}
                    disabled={loadingId === visit.id}
                    className="flex-1 md:flex-none px-3 py-2 text-xs font-medium bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-icons text-[14px]">close</span>
                    Cancelar
                  </button>
                </>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
