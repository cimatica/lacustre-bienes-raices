'use client';

import { useState } from 'react';
import { updateUserRole } from './actions';

const ROLES = ['administrador', 'usuario', 'vendedor', 'agente'];

export default function UserRoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    
    setLoading(true);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      alert(`Error al actualizar: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <select 
      disabled={loading}
      value={currentRole}
      onChange={handleChange}
      className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#006655] focus:border-[#006655] block w-full max-w-[150px] p-2 disabled:opacity-50 ml-auto"
    >
      {ROLES.map(role => (
        <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
      ))}
    </select>
  );
}
