'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAlert } from '@/app/components/ui/AlertProvider';
import { useRouter } from 'next/navigation';

export default function ProfileSettings({ profile, email, dict }: { profile: any, email: string, dict: any }) {
  const supabase = createClient();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || 'https://via.placeholder.com/150');
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone) {
      const phoneRegex = /^[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        showAlert("Error", "El teléfono debe tener exactamente 9 dígitos numéricos (Ej: 912345678)", "warning");
        return;
      }
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          phone: phone,
          location: location,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await supabase.auth.updateUser({
        data: { full_name: fullName, phone: phone }
      });

      showAlert("Perfil Actualizado", "Tus datos han sido actualizados correctamente.", "success");
      router.refresh();
    } catch (error: any) {
      showAlert("Error", error.message || "Error al actualizar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden", "warning");
      return;
    }
    if (newPassword.length < 8) {
      showAlert("Error", "La contraseña debe tener al menos 8 caracteres", "warning");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,64}$/;
    if (!passwordRegex.test(newPassword)) {
      showAlert("Error", "La contraseña debe tener entre 8 y 64 caracteres, una mayúscula, un número, un símbolo, y no contener espacios.", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      showAlert("Contraseña Actualizada", "Tu contraseña ha sido cambiada correctamente.", "success");
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showAlert("Error", error.message || "Error al cambiar contraseña", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 2 * 1024 * 1024) {
      showAlert("Archivo muy grande", "La imagen no debe superar los 2MB", "warning");
      return;
    }

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

      setAvatarUrl(data.publicUrl);
      showAlert("Foto Actualizada", "Tu foto de perfil ha sido actualizada.", "success");
      router.refresh();
    } catch (error: any) {
      showAlert("Error", error.message || "No se pudo subir la imagen", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-lg"
            />
          </div>
          <label className="cursor-pointer bg-surface-dark border border-slate-700 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-icons text-[16px]">add_a_photo</span>
            Cambiar Foto
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={loading} />
          </label>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleUpdateProfile} className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-surface-darkest border border-slate-700/50 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-mosque focus:ring-1 focus:ring-mosque transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
              <div className="flex bg-surface-darkest border border-slate-700/50 rounded-lg overflow-hidden focus-within:border-mosque focus-within:ring-1 focus-within:ring-mosque transition-colors">
                <span className="flex items-center px-4 bg-surface-dark border-r border-slate-700/50 text-slate-400 text-sm">
                  +56
                </span>
                <input 
                  type="tel" 
                  maxLength={9}
                  pattern="^[0-9]{9}$"
                  title="Debe ingresar exactamente 9 dígitos numéricos (Ej: 912345678)"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent px-4 py-3 text-slate-200 focus:outline-none"
                  placeholder="912345678"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ubicación (Ciudad, País)</label>
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Villarrica, Chile"
                className="w-full bg-surface-darkest border border-slate-700/50 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-mosque focus:ring-1 focus:ring-mosque transition-colors"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                disabled 
                value={email}
                className="w-full bg-surface-darkest/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-mosque hover:bg-nordic text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">save</span>}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-slate-700/50 pt-8">
        <h3 className="text-lg font-bold text-white mb-4">Seguridad</h3>
        
        {!showPasswordChange ? (
          <button 
            type="button" 
            onClick={() => setShowPasswordChange(true)}
            className="px-5 py-2.5 rounded-lg border border-slate-700/50 text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cambiar Contraseña
          </button>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md bg-surface-darkest p-6 rounded-xl border border-slate-700/50">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                minLength={8}
                maxLength={64}
                pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,64}$"
                title="Debe tener entre 8 y 64 caracteres, una mayúscula, un número, un símbolo, y no contener espacios"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-surface-dark border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-mosque focus:ring-1 focus:ring-mosque"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
              <input 
                type="password" 
                required 
                minLength={8}
                maxLength={64}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-dark border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-mosque focus:ring-1 focus:ring-mosque"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => { setShowPasswordChange(false); setNewPassword(''); setConfirmPassword(''); }}
                className="flex-1 py-2.5 border border-slate-700/50 text-slate-300 rounded-lg hover:bg-white/5 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-2.5 bg-mosque text-white rounded-lg hover:bg-nordic transition-colors text-sm font-medium"
              >
                Actualizar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
