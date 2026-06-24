'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export default function AdminFilters({ placeholder = 'Buscar por título de propiedad...' }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [term, setTerm] = useState(searchParams.get('query') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [type, setType] = useState(searchParams.get('type') || 'all');

  useEffect(() => {
    setTerm(searchParams.get('query') || '');
    setStatus(searchParams.get('status') || 'all');
    setType(searchParams.get('type') || 'all');
  }, [searchParams]);

  const updateFilters = (newTerm: string, newStatus: string, newType: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      
      if (newTerm) params.set('query', newTerm);
      else params.delete('query');
      
      if (newStatus !== 'all') params.set('status', newStatus);
      else params.delete('status');
      
      if (newType !== 'all') params.set('type', newType);
      else params.delete('type');
      
      params.delete('page'); // Reset pagination
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    updateFilters(value, status, type);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    updateFilters(term, value, type);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setType(value);
    updateFilters(term, status, value);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative group w-full md:flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className={`material-icons text-xl transition-colors ${isPending ? 'text-[#006655] animate-pulse' : 'text-[#19322F]/40 group-focus-within:text-[#006655]'}`}>
            search
          </span>
        </div>
        <input 
          value={term}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-[#19322F] shadow-sm placeholder-[#19322F]/30 focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all text-sm" 
          placeholder={placeholder} 
          type="text" 
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
        <div className="relative w-full sm:w-auto">
          <select 
            value={type} 
            onChange={handleTypeChange}
            className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 bg-gray-50 text-sm text-[#19322F] font-medium focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todas las Operaciones</option>
            <option value="Venta">Venta</option>
            <option value="Renta">Arriendo</option>
          </select>
          <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">expand_more</span>
        </div>

        <div className="relative w-full sm:w-auto">
          <select 
            value={status} 
            onChange={handleStatusChange}
            className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 bg-gray-50 text-sm text-[#19322F] font-medium focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
          <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">expand_more</span>
        </div>
      </div>
    </div>
  );
}
