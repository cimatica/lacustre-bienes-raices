'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { deleteUserByAdmin, updateUserProfile, updateUserStatus, updateUserRole } from './actions';
import { useAlert } from '@/app/components/ui/AlertProvider';

type UserData = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  role: string;
};

export default function UserActionsMenu({ user }: { user: UserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'edit' | 'role' | 'delete' | 'suspend' | null>(null);
  const { showAlert } = useAlert();
  const menuRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  // States for Edit Profile
  const [editName, setEditName] = useState(user.full_name || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');

  // States for Edit Role
  const [editRole, setEditRole] = useState(user.role);
  
  const [mounted, setMounted] = useState(false);
  
  // Close menu on click outside
  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmStatusChange = async () => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const actionName = newStatus === 'Active' ? 'Activar' : 'Suspender';

    setLoading(true);
    const result = await updateUserStatus(user.id, newStatus);
    setLoading(false);

    if (result.error) {
      showAlert('Error', `No se pudo ${actionName.toLowerCase()}: ${result.error}`, 'error');
    } else {
      showAlert('Éxito', `Usuario ${actionName.toLowerCase()}do correctamente.`, 'success');
      setActiveModal(null);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPhone) {
      const phoneRegex = /^[0-9]{9}$/;
      if (!phoneRegex.test(editPhone)) {
        showAlert("Error", "El teléfono debe tener exactamente 9 dígitos numéricos (Ej: 912345678)", "warning");
        return;
      }
    }
    
    setLoading(true);
    const result = await updateUserProfile(user.id, { full_name: editName, phone: editPhone });
    setLoading(false);

    if (result.error) {
      showAlert('Error', result.error, 'error');
    } else {
      showAlert('Actualizado', 'Perfil actualizado correctamente.', 'success');
      setActiveModal(null);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editRole === user.role) {
      setActiveModal(null);
      return;
    }
    setLoading(true);
    const result = await updateUserRole(user.id, editRole);
    setLoading(false);

    if (result.error) {
      showAlert('Error', result.error, 'error');
    } else {
      showAlert('Actualizado', 'Rol actualizado correctamente.', 'success');
      setActiveModal(null);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    const result = await deleteUserByAdmin(user.id);
    setLoading(false);

    if (result.error) {
      showAlert('Error', result.error, 'error');
    } else {
      showAlert('Eliminado', 'El usuario fue eliminado definitivamente.', 'success');
      setActiveModal(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
      >
        <span className="material-icons">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
          <button 
            onClick={() => { setActiveModal('edit'); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <span className="material-icons text-[18px] text-gray-400">edit</span> Editar Perfil
          </button>
          <button 
            onClick={() => { setActiveModal('role'); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <span className="material-icons text-[18px] text-gray-400">admin_panel_settings</span> Cambiar Rol
          </button>
          <button 
            onClick={() => { setActiveModal('suspend'); setIsOpen(false); }}
            disabled={loading}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
          >
            <span className="material-icons text-[18px] text-gray-400">
              {user.status === 'Active' ? 'block' : 'check_circle'}
            </span> 
            {user.status === 'Active' ? 'Suspender Usuario' : 'Activar Usuario'}
          </button>
          <button 
            onClick={() => { setActiveModal('delete'); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
          >
            <span className="material-icons text-[18px] text-red-500">delete_forever</span> Eliminar
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {mounted && activeModal === 'edit' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="material-icons">close</span>
            </button>
            <h2 className="text-xl font-bold text-[#19322F] mb-4">Editar Perfil</h2>
            
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006655] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006655]">
                  <span className="flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-500 text-sm">
                    +56
                  </span>
                  <input 
                    type="tel" 
                    maxLength={9}
                    pattern="^[0-9]{9}$"
                    title="Debe ingresar exactamente 9 dígitos numéricos (Ej: 912345678)"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-sm text-gray-900 focus:outline-none bg-transparent"
                    placeholder="912345678"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-[#006655] rounded-lg hover:bg-[#004d40] transition-colors flex items-center">
                  {loading ? <span className="material-icons animate-spin text-sm mr-2">refresh</span> : null}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Role Modal */}
      {mounted && activeModal === 'role' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="material-icons">close</span>
            </button>
            <h2 className="text-xl font-bold text-[#19322F] mb-4">Cambiar Rol</h2>
            <form onSubmit={handleEditRole} className="space-y-4">
              <select 
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006655]"
              >
                <option value="usuario">Usuario Estándar</option>
                <option value="vendedor">Vendedor</option>
                <option value="agente">Agente Inmobiliario</option>
                <option value="administrador">Administrador</option>
              </select>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-[#006655] rounded-lg hover:bg-[#004d40] transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete User Modal */}
      {mounted && activeModal === 'delete' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="material-icons">close</span>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-2xl">warning</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-600">Eliminar Usuario</h2>
                <p className="text-sm text-gray-500">Acción irreversible</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              Estás a punto de eliminar definitivamente al usuario <strong>{user.email}</strong>. 
              Esto borrará su perfil, roles, propiedades publicadas y guardadas. Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
              <button 
                onClick={handleDeleteUser} 
                disabled={loading} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                {loading ? <span className="material-icons animate-spin text-sm mr-2">refresh</span> : null}
                Sí, Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Suspend/Activate User Modal */}
      {mounted && activeModal === 'suspend' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="material-icons">close</span>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${user.status === 'Active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                <span className="material-icons text-2xl">{user.status === 'Active' ? 'block' : 'check_circle'}</span>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${user.status === 'Active' ? 'text-orange-600' : 'text-green-600'}`}>
                  {user.status === 'Active' ? 'Suspender Usuario' : 'Activar Usuario'}
                </h2>
                <p className="text-sm text-gray-500">Cambio de estado</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              ¿Estás seguro de que deseas <strong>{user.status === 'Active' ? 'suspender' : 'activar'}</strong> al usuario <strong>{user.email}</strong>?
              {user.status === 'Active' ? ' El usuario será expulsado de la plataforma y no podrá navegar.' : ' El usuario recuperará su acceso normal a la plataforma.'}
            </p>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
              <button 
                onClick={handleConfirmStatusChange} 
                disabled={loading} 
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center ${user.status === 'Active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {loading ? <span className="material-icons animate-spin text-sm mr-2">refresh</span> : null}
                Sí, {user.status === 'Active' ? 'Suspender' : 'Activar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
