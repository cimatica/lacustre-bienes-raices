'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { updateCommercialStatus } from '@/app/admin/actions';
import { useAlert } from '@/app/components/ui/AlertProvider';

type CommercialStatus = {
  id: string;
  name: string;
};

export default function CommercialStatusDropdown({
  propertyId,
  currentStatusId,
  statuses,
  disabled = false
}: {
  propertyId: string;
  currentStatusId: string;
  statuses: CommercialStatus[];
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showAlert } = useAlert();
  const menuRef = useRef<HTMLDivElement>(null);

  const currentStatus = statuses.find(s => s.id === currentStatusId) || statuses[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (statusId: string) => {
    setIsOpen(false);
    if (statusId === currentStatusId) return;

    startTransition(async () => {
      try {
        await updateCommercialStatus(propertyId, statusId);
        showAlert("Actualizado", "La situación comercial ha sido actualizada", "success");
      } catch (err) {
        showAlert("Error", "No se pudo actualizar el estado", "error");
      }
    });
  };

  const getStatusColor = (name: string) => {
    switch (name) {
      case 'Disponible': return 'bg-[#D9ECC8] text-[#006655] border-[#006655]/10';
      case 'Vendida': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'Arrendada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Reservada': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getStatusIcon = (name: string) => {
    switch (name) {
      case 'Disponible': return 'check_circle';
      case 'Vendida': return 'sell';
      case 'Arrendada': return 'key';
      case 'Reservada': return 'schedule';
      default: return 'info';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        disabled={isPending || disabled}
        onClick={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${getStatusColor(currentStatus?.name)} ${disabled ? '' : 'hover:opacity-80 cursor-pointer'} ${isPending ? 'opacity-50' : ''}`}
      >
        <span className="material-icons text-[14px]">{getStatusIcon(currentStatus?.name)}</span>
        {currentStatus?.name}
        {!disabled && <span className="material-icons text-[14px] ml-0.5">{isOpen ? 'expand_less' : 'expand_more'}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-36 rounded-xl shadow-xl bg-white border border-gray-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {statuses.map((status) => (
            <button
              key={status.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(status.id);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                status.id === currentStatusId ? 'text-[#006655] bg-[#D9ECC8]/20' : 'text-gray-700'
              }`}
            >
              <span className="material-icons text-[14px] opacity-70">{getStatusIcon(status.name)}</span>
              {status.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
