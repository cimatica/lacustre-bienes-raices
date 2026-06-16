"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  initialLat: number | null;
  initialLng: number | null;
  initialAddress: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export default function LocationPicker({
  initialLat,
  initialLng,
  initialAddress,
  onLocationChange,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  const [address, setAddress] = useState(initialAddress);
  const [searching, setSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Default to center of Chile if no initial location
    const defaultLat = initialLat || -33.4489;
    const defaultLng = initialLng || -70.6693;
    const defaultZoom = initialLat && initialLng ? 15 : 5;

    mapInstance.current = L.map(mapRef.current).setView([defaultLat, defaultLng], defaultZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance.current);

    if (initialLat && initialLng) {
      markerInstance.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstance.current);
      
      markerInstance.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        handleMapClick(position.lat, position.lng);
      });
    }

    mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleMapClick = async (lat: number, lng: number) => {
    if (!mapInstance.current) return;

    // Update marker
    if (!markerInstance.current) {
      markerInstance.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
      markerInstance.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        handleMapClick(position.lat, position.lng);
      });
    } else {
      markerInstance.current.setLatLng([lat, lng]);
    }

    // Reverse geocoding
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (response.ok) {
        const data = await response.json();
        const displayAddress = data.display_name || address;
        setAddress(displayAddress);
        onLocationChange(lat, lng, displayAddress);
      } else {
        onLocationChange(lat, lng, address);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      onLocationChange(lat, lng, address);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const newLat = parseFloat(lat);
          const newLng = parseFloat(lon);
          
          setAddress(display_name);
          onLocationChange(newLat, newLng, display_name);

          if (mapInstance.current) {
            mapInstance.current.setView([newLat, newLng], 15);
            if (!markerInstance.current) {
              markerInstance.current = L.marker([newLat, newLng], { draggable: true }).addTo(mapInstance.current);
              markerInstance.current.on('dragend', (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleMapClick(position.lat, position.lng);
              });
            } else {
              markerInstance.current.setLatLng([newLat, newLng]);
            }
          }
        } else {
          alert("Ubicación no encontrada");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#19322F] mb-1.5" htmlFor="locationSearch">
          Buscar Dirección
        </label>
        <div className="flex gap-2">
          <input
            id="locationSearch"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm"
            placeholder="Ej: Providencia, Santiago"
            type="text"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-[#D9ECC8] hover:bg-[#c2d9af] text-[#006655] rounded-md transition-colors disabled:opacity-50 flex items-center justify-center font-medium text-sm"
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          También puedes hacer clic en el mapa o arrastrar el marcador para afinar la ubicación.
        </p>
      </div>

      <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner z-0">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
