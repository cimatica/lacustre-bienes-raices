"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "./I18nProvider";

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchFiltersModal({ isOpen, onClose }: SearchFiltersModalProps) {
  const router = useRouter();
  const dict = useTranslation();

  // Form state
  const [ubicacion, setUbicacion] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tipoPropiedad, setTipoPropiedad] = useState("Cualquier Tipo");
  const [beds, setBeds] = useState("0");
  const [baths, setBaths] = useState("0");
  const [amenities, setAmenities] = useState<string[]>([]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAmenity = (val: string) => {
    setAmenities(prev => 
      prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (ubicacion) params.set("ubicacion", ubicacion);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (tipoPropiedad && tipoPropiedad !== "Cualquier Tipo" && tipoPropiedad !== dict.filters.anyType) params.set("tipoPropiedad", tipoPropiedad);
    if (beds !== "0") params.set("beds", beds);
    if (baths !== "0") params.set("baths", baths);
    if (amenities.length > 0) params.set("amenities", amenities.join(','));

    router.push(`/buscar?${params.toString()}`);
    onClose();
  };

  const handleClear = () => {
    setUbicacion("");
    setMinPrice("");
    setMaxPrice("");
    setTipoPropiedad(dict.filters.anyType);
    setBeds("0");
    setBaths("0");
    setAmenities([]);
  };

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Main Modal Container */}
      <main className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-30">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{dict.filters.title}</h1>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <span className="material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{dict.filters.location}</label>
            <div className="relative group">
              <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">location_on</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-background-light dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm" 
                placeholder={dict.filters.locationPlaceholder}
                type="text" 
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{dict.filters.priceRange}</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-light dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">{dict.filters.minPrice}</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input 
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm focus:outline-none" 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={minPrice}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setMinPrice(val);
                    }}
                    onBlur={() => {
                      if (minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice)) {
                        setMinPrice(maxPrice);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="bg-background-light dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">{dict.filters.maxPrice}</label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input 
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm focus:outline-none" 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={dict.filters.unlimited}
                    value={maxPrice}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setMaxPrice(val);
                    }}
                    onBlur={() => {
                      if (minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice)) {
                        setMaxPrice(minPrice);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{dict.filters.propertyType}</label>
              <div className="relative">
                <select 
                  className="w-full bg-background-light dark:bg-gray-800 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-mosque focus:outline-none cursor-pointer"
                  value={tipoPropiedad}
                  onChange={e => setTipoPropiedad(e.target.value)}
                >
                  <option value={dict.filters.anyType}>{dict.filters.anyType}</option>
                  <option value="Casa">{dict.hero?.types?.Casa || "Casa"}</option>
                  <option value="Apartamento">{dict.hero?.types?.Apartamento || "Apartamento"}</option>
                  <option value="Villa">{dict.hero?.types?.Villa || "Villa"}</option>
                  <option value="Penthouse">{dict.hero?.types?.Penthouse || "Penthouse"}</option>
                </select>
                <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-4">
              {/* Beds */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dict.filters.beds}</span>
                <div className="flex items-center space-x-3 bg-background-light dark:bg-gray-800 rounded-full p-1">
                  <button 
                    onClick={() => setBeds(prev => Math.max(0, parseInt(prev) - 1).toString())}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque transition-colors"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-4 text-center text-gray-900 dark:text-white">{beds}</span>
                  <button 
                    onClick={() => setBeds(prev => (parseInt(prev) + 1).toString())}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Baths */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dict.filters.baths}</span>
                <div className="flex items-center space-x-3 bg-background-light dark:bg-gray-800 rounded-full p-1">
                  <button 
                    onClick={() => setBaths(prev => Math.max(0, parseInt(prev) - 1).toString())}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque transition-colors"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-4 text-center text-gray-900 dark:text-white">{baths}</span>
                  <button 
                    onClick={() => setBaths(prev => (parseInt(prev) + 1).toString())}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{dict.filters.amenitiesTitle}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: "pool", label: dict.filters.amenities.pool, icon: "pool" },
                { id: "gym", label: dict.filters.amenities.gym, icon: "fitness_center" },
                { id: "parking", label: dict.filters.amenities.parking, icon: "local_parking" },
                { id: "ac", label: dict.filters.amenities.ac, icon: "ac_unit" },
                { id: "wifi", label: dict.filters.amenities.wifi, icon: "wifi" },
                { id: "patio", label: dict.filters.amenities.patio, icon: "deck" },
              ].map(amenity => {
                const isChecked = amenities.includes(amenity.id);
                return (
                  <label key={amenity.id} className="cursor-pointer group relative">
                    <input 
                      checked={isChecked}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="peer sr-only" 
                      type="checkbox" 
                    />
                    <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${isChecked ? 'border-mosque bg-mosque/10 text-mosque' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'}`}>
                      <span className={`material-icons text-lg ${isChecked ? 'text-mosque' : 'text-gray-400 group-hover:text-gray-500'}`}>{amenity.icon}</span>
                      {amenity.label}
                    </div>
                    {isChecked && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button 
            onClick={handleClear}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors underline decoration-gray-300 underline-offset-4"
          >
            {dict.filters.clearFilters}
          </button>
          <button 
            onClick={handleSearch}
            className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
          >
            {dict.filters.searchBtn}
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </main>
    </>
  );
}
