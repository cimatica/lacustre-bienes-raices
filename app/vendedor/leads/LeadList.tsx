'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

type Lead = {
  id: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
  property: {
    id: string;
    title: string;
    image_url: string | null;
    location: string;
    agent: { full_name: string } | null;
  };
  visits: { visit_date: string, status: string }[];
};

export default function LeadList({ leads }: { leads: Lead[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const formatWhatsAppUrl = (phone: string | null) => {
    if (!phone) return null;
    // Remove non numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Ensure it starts with country code (assuming 56 for Chile as default if 9 digits)
    if (cleanPhone.length === 9) {
      return `https://wa.me/56${cleanPhone}`;
    }
    return `https://wa.me/${cleanPhone}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-6 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Interesado</div>
          <div className="col-span-3">Propiedad</div>
          <div className="col-span-2">Agente Asignado</div>
          <div className="col-span-2">Agendamiento</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* List Items */}
        {leads.map((lead) => {
          const hasVisit = lead.visits && lead.visits.length > 0;
          const nextVisit = hasVisit ? lead.visits.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0] : null;

          return (
            <div key={lead.id} className="group grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 py-6 border-b border-gray-100 hover:bg-[#EEF6F6] transition-colors items-center">
              
              {/* Interesado */}
              <div className="col-span-12 lg:col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006655]/10 text-[#006655] flex items-center justify-center font-bold flex-shrink-0">
                  {lead.user.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#19322F] truncate">{lead.user.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{lead.user.email}</p>
                </div>
              </div>

              {/* Propiedad */}
              <div className="col-span-12 lg:col-span-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  {lead.property.image_url ? (
                    <img src={lead.property.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-icons text-gray-400 w-full h-full flex items-center justify-center text-sm">image</span>
                  )}
                </div>
                <div className="min-w-0">
                  <Link href={`/property/${lead.property.id}`} target="_blank" className="font-bold text-sm text-[#19322F] hover:text-[#006655] transition-colors truncate block">
                    {lead.property.title}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{lead.property.location}</p>
                </div>
              </div>

              {/* Agente */}
              <div className="col-span-12 lg:col-span-2">
                <p className="text-sm font-medium text-[#19322F] truncate">
                  {lead.property.agent ? lead.property.agent.full_name : <span className="text-gray-400 italic">No asignado</span>}
                </p>
                <p className="text-xs text-gray-500 lg:hidden">Agente Asignado</p>
              </div>

              {/* Agendamiento */}
              <div className="col-span-12 lg:col-span-2">
                {nextVisit ? (
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#D9ECC8]/50 text-[#006655] border border-[#006655]/20 mb-1">
                      Agendado
                    </span>
                    <p className="text-xs font-medium text-[#19322F]">{formatDate(nextVisit.visit_date)}</p>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                    Sin Agendar
                  </span>
                )}
              </div>

              {/* Acciones */}
              <div className="col-span-12 lg:col-span-2 flex justify-end">
                <button 
                  onClick={() => setSelectedLead(lead)}
                  className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-[#19322F] rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <span className="material-icons text-base text-gray-400">visibility</span>
                  Ver Perfil
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Perfil del Interesado */}
      {selectedLead && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#006655] px-6 py-8 text-center relative">
              <button 
                onClick={() => setSelectedLead(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30 backdrop-blur-md">
                <span className="material-icons text-4xl text-white">person</span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedLead.user.full_name}</h2>
              <p className="text-[#D9ECC8] text-sm">Interesado en tu propiedad</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <span className="material-icons text-sm">email</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Correo Electrónico</p>
                  <p className="text-sm font-medium text-[#19322F] truncate">{selectedLead.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <span className="material-icons text-sm">phone</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-medium text-[#19322F] truncate">{selectedLead.user.phone || 'No registrado'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Propiedad de interés</p>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                    {selectedLead.property.image_url ? (
                      <img src={selectedLead.property.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-icons text-gray-400 text-xs w-full h-full flex items-center justify-center">image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#19322F] truncate">{selectedLead.property.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">Agente: {selectedLead.property.agent?.full_name || 'Sin asignar'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                {selectedLead.user.phone ? (
                  <a 
                    href={formatWhatsAppUrl(selectedLead.user.phone) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-4 py-3 rounded-lg font-medium cursor-not-allowed">
                    <span className="material-icons text-base">phone_disabled</span>
                    Sin teléfono registrado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
