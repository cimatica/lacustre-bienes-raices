'use client';

import { useState } from 'react';
import { createUserByAdmin } from './actions';

export default function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await createUserByAdmin(formData);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2.5 border border-[#006655] text-sm font-medium rounded-lg text-[#006655] bg-transparent hover:bg-[#006655]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006655] transition-colors whitespace-nowrap"
      >
        <span className="material-icons text-lg mr-2">add</span>
        Añadir Usuario
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#19322F]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#19322F]">Nuevo Usuario</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#006655] focus:ring-[#006655] text-sm py-2 px-3 text-[#19322F]"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#006655] focus:ring-[#006655] text-sm py-2 px-3 text-[#19322F]"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#006655] focus:ring-[#006655] text-sm py-2 px-3 text-[#19322F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol Asignado</label>
                <select 
                  name="role"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#006655] focus:ring-[#006655] text-sm py-2 px-3 text-[#19322F]"
                >
                  <option value="usuario">Usuario</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="agente">Agente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006655]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#006655] border border-transparent rounded-lg hover:bg-[#004d40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006655] disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
