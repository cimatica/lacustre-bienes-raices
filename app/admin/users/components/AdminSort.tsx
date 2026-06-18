'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type SortOption = {
  label: string;
  orderBy: string;
  orderDir: 'asc' | 'desc';
  icon: string;
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Más recientes', orderBy: 'member_since', orderDir: 'desc', icon: 'schedule' },
  { label: 'Más antiguos', orderBy: 'member_since', orderDir: 'asc', icon: 'history' },
  { label: 'Nombre (A-Z)', orderBy: 'full_name', orderDir: 'asc', icon: 'sort_by_alpha' },
  { label: 'Nombre (Z-A)', orderBy: 'full_name', orderDir: 'desc', icon: 'sort_by_alpha' },
  { label: 'Correo (A-Z)', orderBy: 'email', orderDir: 'asc', icon: 'alternate_email' },
  { label: 'Estado', orderBy: 'status', orderDir: 'asc', icon: 'toggle_on' },
];

export default function AdminSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentOrderBy = searchParams.get('orderBy') || 'member_since';
  const currentOrderDir = searchParams.get('orderDir') || 'desc';

  const currentOption = SORT_OPTIONS.find(
    o => o.orderBy === currentOrderBy && o.orderDir === currentOrderDir
  ) || SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SortOption) => {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set('orderBy', option.orderBy);
    params.set('orderDir', option.orderDir);
    // Reset page to 1 on sort change
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative z-10" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#19322F]/20 hover:border-[#006655] hover:bg-[#D9ECC8]/10 text-sm font-medium text-[#19322F] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#006655]/20 shadow-sm"
      >
        <span className="material-icons text-[18px] text-[#006655]">{currentOption.icon}</span>
        <span className="hidden sm:inline">Ordenar:</span> {currentOption.label}
        <span className="material-icons text-[18px] text-gray-400 ml-1">{isOpen ? 'expand_less' : 'expand_more'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
          {SORT_OPTIONS.map((option, idx) => {
            const isActive = option.orderBy === currentOrderBy && option.orderDir === currentOrderDir;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[#D9ECC8]/30 transition-colors ${
                  isActive ? 'bg-[#D9ECC8]/20 text-[#006655] font-semibold' : 'text-gray-700 font-medium'
                }`}
              >
                <span className={`material-icons text-[18px] ${isActive ? 'text-[#006655]' : 'text-gray-400'}`}>
                  {option.icon}
                </span>
                {option.label}
                {isActive && <span className="material-icons text-[16px] text-[#006655] ml-auto">check</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
