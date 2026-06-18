"use client";

import { useEffect, useRef } from "react";

type Props = {
  latitude: number | null;
  longitude: number | null;
};

export default function PropertyMap({ latitude, longitude }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    let map: any;

    const initMap = async () => {
      // Dynamic import to avoid SSR issues
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapRef.current && !mapRef.current.innerHTML) {
         map = L.map(mapRef.current).setView([latitude, longitude], 15);
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             maxZoom: 19,
             attribution: '© OpenStreetMap'
         }).addTo(map);

         const customIcon = L.divIcon({
            html: `
              <div class="w-8 h-8 bg-mosque rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                 <span class="material-icons text-white text-[16px]">home</span>
              </div>
            `,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
         });

         L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      }
    };

    initMap().catch(console.error);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <div className="bg-surface-dark p-2 rounded-xl shadow-sm border border-slate-700/50">
        <div className="w-full aspect-[4/3] bg-surface-darker rounded-lg flex items-center justify-center">
          <p className="text-slate-400 font-medium">Ubicación no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark p-2 rounded-xl shadow-sm border border-slate-700/50">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-darker z-0">
         <div ref={mapRef} className="w-full h-full" />
         <a 
           className="absolute bottom-2 right-2 bg-surface-darkest/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-slate-300 hover:text-mosque z-[1000]" 
           href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`} 
           target="_blank" 
           rel="noreferrer"
         >
           Ver en Google Maps
         </a>
      </div>
    </div>
  );
}
