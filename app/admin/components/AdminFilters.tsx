'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export default function AdminFilters({ 
  placeholder = 'Buscar por título de propiedad...',
  sellers = [],
  agents = []
}: { 
  placeholder?: string;
  sellers?: { id: string; name: string }[];
  agents?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [term, setTerm] = useState(searchParams.get('query') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [vendedor, setVendedor] = useState(searchParams.get('vendedor') || 'all');
  const [agente, setAgente] = useState(searchParams.get('agente') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_desc');

  useEffect(() => {
    setTerm(searchParams.get('query') || '');
    setStatus(searchParams.get('status') || 'all');
    setType(searchParams.get('type') || 'all');
    setVendedor(searchParams.get('vendedor') || 'all');
    setAgente(searchParams.get('agente') || 'all');
    setSort(searchParams.get('sort') || 'date_desc');
  }, [searchParams]);

  const updateFilters = (
    newTerm: string, 
    newStatus: string, 
    newType: string,
    newVendedor: string,
    newAgente: string,
    newSort: string
  ) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      
      if (newTerm) params.set('query', newTerm);
      else params.delete('query');
      
      if (newStatus !== 'all') params.set('status', newStatus);
      else params.delete('status');
      
      if (newType !== 'all') params.set('type', newType);
      else params.delete('type');

      if (newVendedor !== 'all') params.set('vendedor', newVendedor);
      else params.delete('vendedor');

      if (newAgente !== 'all') params.set('agente', newAgente);
      else params.delete('agente');

      if (newSort !== 'date_desc') params.set('sort', newSort);
      else params.delete('sort');
      
      params.delete('page'); // Reset pagination
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    updateFilters(value, status, type, vendedor, agente, sort);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    updateFilters(term, value, type, vendedor, agente, sort);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setType(value);
    updateFilters(term, status, value, vendedor, agente, sort);
  };

  const handleVendedorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setVendedor(value);
    updateFilters(term, status, type, value, agente, sort);
  };

  const handleAgenteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAgente(value);
    updateFilters(term, status, type, vendedor, value, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value);
    updateFilters(term, status, type, vendedor, agente, value);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`material-icons text-xl transition-colors ${isPending ? 'text-[#006655] animate-pulse' : 'text-[#19322F]/40 focus-within:text-[#006655]'}`}>
              search
            </span>
          </div>
          <input 
            value={term}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-[#19322F] shadow-sm placeholder-[#19322F]/30 focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all text-sm" 
            placeholder={placeholder} 
            type="text" 
          />
        </div>

        {/* Top Filters */}
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 sm:w-48">
            <select 
              value={type} 
              onChange={handleTypeChange}
              className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-gray-50 text-xs sm:text-sm text-[#19322F] font-medium focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="all">Todas las Operaciones</option>
              <option value="Venta">Venta</option>
              <option value="Renta">Arriendo</option>
            </select>
            <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">expand_more</span>
          </div>

          <div className="relative flex-1 sm:w-40">
            <select 
              value={status} 
              onChange={handleStatusChange}
              className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-gray-50 text-xs sm:text-sm text-[#19322F] font-medium focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
            <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">expand_more</span>
          </div>
        </div>
      </div>

      {/* Bottom Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="relative">
          <select 
            value={vendedor} 
            onChange={handleVendedorChange}
            className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-gray-50 text-xs sm:text-sm text-[#19322F] font-medium focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todos los Vendedores</option>
            <option value="unassigned">Sin Vendedor Asignado</option>
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">expand_more</span>
        </div>

        <div className="relative">
          <select 
            value={agente} 
            onChange={handleAgenteChange}
            className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-gray-50 text-xs sm:text-sm text-[#19322F] font-medium focus:ring-2 focus:ring-[#006655] focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todos los Agentes</option>
            <option value="unassigned">Sin Agente Asignado</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">expand_more</span>
        </div>

        <div className="relative">
          <select 
            value={sort} 
            onChange={handleSortChange}
            className="w-full border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-[#EEF6F6] text-xs sm:text-sm text-[#006655] font-semibold focus:ring-2 focus:ring-[#006655] focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="date_desc">Más recientes primero</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="status_asc">Estado Comercial (A-Z)</option>
            <option value="status_desc">Estado Comercial (Z-A)</option>
          </select>
          <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-[#006655]/60 pointer-events-none text-base">sort</span>
        </div>
      </div>
    </div>
  );
}
