'use client'

import React, { useTransition } from 'react';
import { togglePropertyStatus, deleteProperty } from '@/app/admin/actions';
import Link from 'next/link';
import { useAlert } from '@/app/components/ui/AlertProvider';

export function PropertyActions({ property }: { property: any }) {
  const [isPending, startTransition] = useTransition();
  const { showAlert, showConfirm } = useAlert();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await togglePropertyStatus(property.id, property.is_active);
      } catch (err) {
        showAlert("Error", "Error al actualizar estado", "error");
      }
    });
  };

  const handleDelete = async () => {
    const isConfirmed = await showConfirm(
      "Eliminar Propiedad", 
      "¿Estás seguro de que quieres eliminar esta propiedad? Se eliminarán los registros y se perderá el historial. Esta acción es irreversible."
    );
    
    if (isConfirmed) {
      startTransition(async () => {
        try {
          await deleteProperty(property.id);
        } catch (err) {
          showAlert("Error", "Error al eliminar la propiedad", "error");
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${property.is_active ? 'bg-[#006655]' : 'bg-gray-300'} disabled:opacity-50`}
        title={property.is_active ? 'Desactivar Propiedad' : 'Activar Propiedad'}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>

      <Link href={`/admin/properties/${property.id}`} className="p-2 rounded-lg text-gray-400 hover:text-[#006655] hover:bg-[#D9ECC8]/30 transition-all" title="Editar Propiedad">
        <span className="material-icons text-xl">edit</span>
      </Link>

      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50" 
        title="Eliminar Propiedad"
      >
        <span className="material-icons text-xl">delete_outline</span>
      </button>
    </div>
  );
}
