'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAlert } from '@/app/components/ui/AlertProvider';
import { updateOwnProfile } from './actions';

export default function VendedorNavbar({ user, userRole, initialProfile }: { user: any, userRole: string, initialProfile: any }) {
  const pathname = usePathname();
  const { showAlert } = useAlert();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editName, setEditName] = useState(initialProfile?.full_name || user.user_metadata?.full_name || '');
  const [editPhone, setEditPhone] = useState(initialProfile?.phone || '');
  const [editLocation, setEditLocation] = useState(initialProfile?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || user.user_metadata?.avatar_url || 'https://via.placeholder.com/150');

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Propiedades', href: '/vendedor/properties' },
    { name: 'Interesados', href: '/vendedor/leads' },
    { name: 'Visitas', href: '/vendedor/visits' },
  ];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showAlert("Archivo muy grande", "La imagen no debe superar los 2MB", "warning");
      return;
    }
    setLoading(true);
    const { createClient } = await import('@/utils/supabase/client');
    const supabaseClient = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    try {
      const { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabaseClient.from('user_profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      await supabaseClient.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      setAvatarUrl(data.publicUrl);
      showAlert("Foto Actualizada", "Tu foto de perfil ha sido actualizada.", "success");
    } catch (err: any) {
      showAlert("Error", err.message || "Error al subir imagen", "error");
    } finally {
      setLoading(false);
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
    const result = await updateOwnProfile({ full_name: editName, phone: editPhone, location: editLocation });
    setLoading(false);

    if (result.error) {
      showAlert('Error', result.error, 'error');
    } else {
      showAlert('Actualizado', 'Perfil actualizado correctamente.', 'success');
      setIsEditModalOpen(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-[80] bg-white border-b border-[#006655]/10 backdrop-blur-md bg-opacity-90">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                <img src="/img/logo_navbar.png" alt="Logo" className="h-8 w-auto object-contain" />
                <span className="font-bold text-xl tracking-tight text-[#19322F] flex items-center gap-2">
                  <span className="text-base text-gray-500 font-medium hidden sm:inline">Lacustre - Bienes Raíces</span>
                  <span className="hidden sm:inline text-gray-300">|</span> 
                  Vendedor
                </span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-[#006655] text-[#19322F]'
                          : 'border-transparent text-gray-500 hover:text-[#006655] hover:border-[#006655]/30'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 group relative py-3">
                {user ? (
                  <>
                    <div className="flex flex-col items-end hidden sm:flex cursor-pointer">
                      <span className="text-sm font-semibold text-[#19322F]">
                        {editName || user.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{userRole}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white cursor-pointer flex items-center justify-center">
                      {avatarUrl ? (
                        <img alt="User profile" className="h-full w-full object-cover" src={avatarUrl} />
                      ) : (
                        <span className="material-icons text-gray-500">person</span>
                      )}
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 min-w-[220px] z-50 translate-y-[-10px] group-hover:translate-y-0">
                      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 p-1.5 flex flex-col">
                        <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Conectado como</p>
                          <p className="text-sm text-[#19322F] font-medium truncate">{user.email}</p>
                        </div>
                        <button 
                          onClick={() => setIsEditModalOpen(true)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#19322F] hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1"
                        >
                          <span className="material-icons text-[18px]">edit</span>
                          Editar Perfil
                        </button>
                        <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#19322F] hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                          <span className="material-icons text-[18px]">web</span>
                          Volver al sitio
                        </Link>
                        <form action="/auth/signout" method="post" className="w-full">
                          <button type="submit" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors">
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Cerrar sesión
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#006655] transition-colors">
                    Volver al sitio
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Edit Profile Modal */}
      {mounted && isEditModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="material-icons">close</span>
            </button>
            <h2 className="text-xl font-bold text-[#19322F] mb-4">Editar Perfil</h2>
            
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div className="flex flex-col items-center space-y-4 mb-4">
                <div className="relative w-24 h-24">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-gray-200" />
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 shadow-sm">
                  <span className="material-icons text-[14px]">add_a_photo</span>
                  Cambiar Foto
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={loading} />
                </label>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (Ciudad, País)</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  placeholder="Ej: Villarrica, Chile"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006655] focus:border-transparent"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
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
    </>
  );
}
