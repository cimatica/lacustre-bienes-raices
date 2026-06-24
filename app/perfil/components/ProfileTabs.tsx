'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatUF } from '@/lib/currency';
import ProfileSettings from './ProfileSettings';

export default function ProfileTabs({ favorites, visits, profile, email, dict }: any) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'visits' | 'preferences'>('favorites');

  const tab1Label = dict?.userProfile?.savedProperties || "Propiedades Guardadas";
  const tab2Label = dict?.userProfile?.scheduledVisits || "Visitas Programadas";
  const tab3Label = dict?.userProfile?.preferences || "Preferencias";

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-700/50 mb-10 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`pb-4 px-2 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'favorites' ? 'text-white border-mosque' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'}`}
        >
          {tab1Label}
        </button>
        <button 
          onClick={() => setActiveTab('visits')}
          className={`pb-4 px-2 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'visits' ? 'text-white border-mosque' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'}`}
        >
          {tab2Label}
        </button>
        <button 
          onClick={() => setActiveTab('preferences')}
          className={`pb-4 px-2 font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'preferences' ? 'text-white border-mosque' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'}`}
        >
          {tab3Label}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {favorites.length === 0 ? (
               <div className="col-span-full py-16 text-center bg-surface-darker rounded-xl border border-slate-700/50">
                 <span className="material-icons text-slate-500 text-5xl mb-4">favorite_border</span>
                 <h3 className="text-xl font-medium text-white mb-2">No tienes propiedades guardadas</h3>
                 <p className="text-slate-400 mb-6 max-w-md mx-auto">Explora nuestro catálogo y guarda las propiedades que más te interesen para darles seguimiento.</p>
                 <Link href="/" className="inline-block bg-mosque hover:bg-nordic text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                   Explorar Propiedades
                 </Link>
               </div>
            ) : favorites.map((fav: any) => {
              const property = fav.property;
              if (!property) return null;
              const imageUrl = property.property_images?.find((img: any) => img.is_main)?.image_url || property.property_images?.[0]?.image_url || 'https://via.placeholder.com/400';
              return (
                <div key={fav.id} className="group bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 flex flex-col h-full">
                  <Link href={`/propiedad/${property.slug}`}>
                    <div className="relative h-64 overflow-hidden">
                      <img alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={imageUrl} />
                      <div className="absolute top-4 right-4 z-10">
                        <button className="w-10 h-10 bg-mosque backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-sm transition-colors">
                          <span className="material-icons text-lg">favorite</span>
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-surface-darkest/90 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-medium z-10">
                        {formatUF(property.price)}
                      </div>
                    </div>
                  </Link>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-1 mb-4">{property.location}</p>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-sm border-t border-slate-700/50 pt-4">
                      <div className="flex items-center gap-1.5"><span className="material-icons text-base">bed</span> {property.beds}</div>
                      <div className="flex items-center gap-1.5"><span className="material-icons text-base">bathtub</span> {property.baths}</div>
                      <div className="flex items-center gap-1.5"><span className="material-icons text-base">square_foot</span> {property.area}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {visits.length === 0 ? (
              <div className="py-16 text-center bg-surface-darker rounded-xl border border-slate-700/50">
                <span className="material-icons text-slate-500 text-5xl mb-4">calendar_month</span>
                <h3 className="text-xl font-medium text-white mb-2">No tienes visitas programadas</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">Cuando programes una visita a una propiedad, aparecerá aquí.</p>
              </div>
            ) : visits.map((v: any, i: number) => {
              const prop = v.property;
              if (!prop) return null;
              const dateObj = new Date(v.visit_date);
              const isPast = dateObj < new Date() && v.status === 'scheduled';
              const imageUrl = prop.property_images?.find((img: any) => img.is_main)?.image_url || prop.property_images?.[0]?.image_url || 'https://via.placeholder.com/200';
              
              return (
                <div key={v.id} className="flex flex-col md:flex-row bg-surface-darker p-2 rounded-xl border border-slate-700/50 items-center hover:bg-surface-dark transition-colors shadow-sm">
                  <div className="w-full md:w-48 h-32 md:h-24 rounded-lg overflow-hidden shrink-0 relative">
                    <img alt="Thumbnail" className="w-full h-full object-cover" src={imageUrl} />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-mosque font-semibold text-sm mb-1 uppercase tracking-wide">
                        <span className="material-icons text-base">calendar_today</span> {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {isPast && <span className="ml-2 text-[10px] text-orange-500 border border-orange-500/50 bg-orange-500/10 px-1.5 py-0.5 rounded">Pendiente de completar</span>}
                      </div>
                      <h4 className="text-lg font-bold text-white"><Link href={`/propiedad/${prop.slug}`} className="hover:text-mosque transition-colors">{prop.title}</Link></h4>
                      <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                        <span className="material-icons text-sm">location_on</span> {prop.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 w-full md:w-auto">
                      <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        v.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        v.status === 'completed' ? 'bg-mosque/10 text-mosque border border-mosque/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {v.status === 'scheduled' ? 'Agendada' : v.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-surface-darker rounded-2xl p-8 border border-slate-700/50 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-white">{dict?.userProfile?.accountPreferences || "Configuración de la Cuenta"}</h2>
                <p className="text-slate-400 text-sm mt-1">{dict?.userProfile?.accountPreferencesDesc || "Gestiona tus datos personales y seguridad"}</p>
              </div>
            </div>
            
            <ProfileSettings profile={profile} email={email} dict={dict} />
          </div>
        )}
      </div>
    </div>
  );
}
