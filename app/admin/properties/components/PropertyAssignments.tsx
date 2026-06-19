"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { assignPropertyUser, unassignPropertyUser } from "@/app/admin/actions";
import { useAlert } from "@/app/components/ui/AlertProvider";

type Assignment = {
  user_id: string;
  role_types: { name: string };
  user_profiles: { id: string, full_name: string };
};

type Props = {
  propertyId: string;
  initialAssignments: Assignment[];
  currentUserRole: string;
};

export default function PropertyAssignments({ propertyId, initialAssignments, currentUserRole }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const [availableSellers, setAvailableSellers] = useState<{ id: string, name: string }[]>([]);
  const [availableAgents, setAvailableAgents] = useState<{ id: string, name: string }[]>([]);

  const [vendedorId, setVendedorId] = useState<string>("");
  const [agenteId, setAgenteId] = useState<string>("");

  useEffect(() => {
    if (isModalOpen) {
      // Sync local state when modal opens
      const seller = assignments.find((a: any) => a.role_types?.name === 'vendedor');
      const agent = assignments.find((a: any) => a.role_types?.name === 'agente');
      setVendedorId(seller?.user_id || "");
      setAgenteId(agent?.user_id || "");

      // Fetch users
      const fetchUsers = async () => {
        const supabase = createClient();
        const { data: roleUsers } = await supabase
          .from('user_roles')
          .select('user_profiles(id, full_name), role_types(name)');
        
        if (roleUsers) {
          const sellers = roleUsers
            .filter((ru: any) => ru.role_types?.name === 'vendedor')
            .map((ru: any) => ({ id: ru.user_profiles.id, name: ru.user_profiles.full_name }));
          const agents = roleUsers
            .filter((ru: any) => ru.role_types?.name === 'agente')
            .map((ru: any) => ({ id: ru.user_profiles.id, name: ru.user_profiles.full_name }));
          setAvailableSellers(sellers);
          setAvailableAgents(agents);
        }
      };
      fetchUsers();
    }
  }, [isModalOpen, assignments]);

  const seller = assignments.find((a: any) => a.role_types?.name === 'vendedor');
  const agent = assignments.find((a: any) => a.role_types?.name === 'agente');

  const handleSave = async () => {
    if (!vendedorId) {
      showAlert("Error", "Debes asignar un vendedor.", "error");
      return;
    }
    setLoading(true);
    try {
      if (vendedorId) {
        await assignPropertyUser(propertyId, vendedorId, 'vendedor');
      } else {
        await unassignPropertyUser(propertyId, 'vendedor');
      }
      
      if (agenteId) {
        await assignPropertyUser(propertyId, agenteId, 'agente');
      } else {
        await unassignPropertyUser(propertyId, 'agente');
      }

      // Update local state to reflect changes without reload
      const newAssignments: Assignment[] = [];
      const selectedSeller = availableSellers.find(s => s.id === vendedorId);
      if (selectedSeller) {
        newAssignments.push({ user_id: vendedorId, role_types: { name: 'vendedor' }, user_profiles: { id: vendedorId, full_name: selectedSeller.name } });
      }
      const selectedAgent = availableAgents.find(a => a.id === agenteId);
      if (selectedAgent) {
        newAssignments.push({ user_id: agenteId, role_types: { name: 'agente' }, user_profiles: { id: agenteId, full_name: selectedAgent.name } });
      }
      setAssignments(newAssignments);
      setIsModalOpen(false);
      showAlert("Éxito", "Personal asignado correctamente.", "success");
    } catch (error: any) {
      showAlert("Error", error.message || "Error al asignar personal.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="text-left w-full hover:bg-white p-1 rounded transition-colors group"
      >
        <div className="text-[11px] text-gray-400 font-medium flex justify-between items-center">
          Vendedor
          <span className="material-icons text-[12px] opacity-0 group-hover:opacity-100 transition-opacity text-[#006655]">edit</span>
        </div>
        <div className="text-xs font-semibold text-[#19322F] truncate">
          {seller ? seller.user_profiles?.full_name : <span className="text-red-400">Sin asignar</span>}
        </div>
      </button>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="text-left w-full hover:bg-white p-1 rounded transition-colors group"
      >
        <div className="text-[11px] text-gray-400 font-medium flex justify-between items-center">
          Agente
          <span className="material-icons text-[12px] opacity-0 group-hover:opacity-100 transition-opacity text-[#006655]">edit</span>
        </div>
        <div className="text-xs font-semibold text-[#19322F] truncate">
          {agent ? agent.user_profiles?.full_name : <span className="text-gray-400 italic">No asignado</span>}
        </div>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#19322F]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#19322F]">Asignar Personal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {currentUserRole !== 'administrador' && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex gap-2">
                  <span className="material-icons text-base">info</span>
                  Solo los administradores pueden cambiar al vendedor.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5">Vendedor *</label>
                <select 
                  value={vendedorId}
                  onChange={(e) => setVendedorId(e.target.value)}
                  disabled={currentUserRole !== 'administrador'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#19322F] focus:ring-1 focus:ring-[#006655] focus:border-[#006655] disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="" disabled>Seleccionar Vendedor</option>
                  {availableSellers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#19322F] mb-1.5">Agente</label>
                <select 
                  value={agenteId}
                  onChange={(e) => setAgenteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#19322F] focus:ring-1 focus:ring-[#006655] focus:border-[#006655]"
                >
                  <option value="">Sin Agente Asignado</option>
                  {availableAgents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#19322F] hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-[#006655] text-white rounded-lg hover:bg-[#004d40] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? <span className="material-icons animate-spin text-sm">refresh</span> : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
