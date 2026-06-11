'use client';

import { useState, useRef, useEffect } from 'react';
import { updateUserRole } from './actions';

const ROLES = [
  { id: 'administrador', label: 'Administrador', icon: 'shield' },
  { id: 'vendedor', label: 'Vendedor', icon: 'business_center' },
  { id: 'agente', label: 'Agente', icon: 'support_agent' },
  { id: 'usuario', label: 'Usuario', icon: 'visibility' },
];

export default function UserRoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = async (newRole: string) => {
    setIsOpen(false);
    if (newRole === currentRole) return;
    
    setLoading(true);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      alert(`Error al actualizar: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-[#19322F]/10 bg-white shadow-sm text-xs font-medium rounded-lg text-[#19322F] hover:bg-[#19322F] hover:text-white focus:outline-none transition-colors w-full md:w-auto justify-center disabled:opacity-50"
      >
        {loading ? 'Actualizando...' : 'Cambiar Rol'}
        <span className="material-icons text-[16px] ml-2">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl bg-[#006655] ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50 origin-top-right">
          <div aria-orientation="vertical" className="py-1" role="menu">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleChange(role.id)}
                className={`group flex items-center w-full px-4 py-3 text-xs text-left transition-colors ${
                  currentRole === role.id 
                    ? 'bg-white/20 text-white font-medium' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                role="menuitem"
              >
                <span className={`material-icons text-sm mr-3 ${currentRole === role.id ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                  {role.icon}
                </span>
                {role.label}
              </button>
            ))}
            <div className="border-t border-white/10 my-1"></div>
            <button className="group flex items-center w-full px-4 py-3 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors text-left" role="menuitem">
              <span className="material-icons text-sm mr-3 text-red-300 group-hover:text-red-100">block</span>
              Suspender Usuario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
