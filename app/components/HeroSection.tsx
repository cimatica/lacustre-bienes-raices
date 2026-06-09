"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchFiltersModal from "./SearchFiltersModal";
import { useTranslation } from "./I18nProvider";

export default function HeroSection() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("Todos");
  const router = useRouter();
  const dict = useTranslation();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append("q", searchQuery.trim());
    }
    
    if (propertyType !== "Todos") {
      params.append("tipoPropiedad", propertyType);
    }

    const queryString = params.toString();
    router.push(queryString ? `/buscar?${queryString}` : "/buscar");
  };

  const handleQuickFilter = (type: string) => {
    setPropertyType(type);
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append("q", searchQuery.trim());
    }
    if (type !== "Todos") {
      params.append("tipoPropiedad", type);
    }
    
    const queryString = params.toString();
    router.push(queryString ? `/buscar?${queryString}` : "/buscar");
  };

  const propertyTypes = ["Todos", "Casa", "Apartamento", "Villa", "Penthouse"];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-mosque leading-tight">
          {dict.hero.findYour} <span className="relative inline-block">
            <span className="relative z-10 font-extrabold">{dict.hero.sanctuary}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>.
        </h1>
        
        <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">search</span>
          </div>
          <input 
            className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-lg focus:outline-none" 
            placeholder={dict.hero.searchPlaceholder}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20">
            {dict.hero.searchBtn}
          </button>
        </form>
        
        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {propertyTypes.map((type) => (
            <button 
              key={type}
              onClick={() => handleQuickFilter(type)} 
              type="button"
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                propertyType === type
                  ? "bg-nordic-dark text-white shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5"
                  : "bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
              }`}
            >
              {dict.hero.types[type]}
            </button>
          ))}
          <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 transition-colors"
          >
            <span className="material-icons text-base">tune</span> {dict.hero.filters}
          </button>
        </div>
      </div>
      
      <SearchFiltersModal 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
      />
    </section>
  );
}
