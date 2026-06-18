'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InactiveAccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(true);

  useEffect(() => {
    const forceLogout = async () => {
      await supabase.auth.signOut();
      setLoggingOut(false);
      // We explicitly log them out so their session is destroyed,
      // and they can browse the site as a guest if they want.
    };
    forceLogout();
  }, []);

  return (
    <div className="min-h-screen bg-surface-darkest flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-darker p-8 rounded-2xl shadow-xl border border-slate-700/50 text-center">
        <div className="w-16 h-16 bg-orange-500/10 text-orange-500 flex items-center justify-center rounded-full mx-auto mb-6">
          <span className="material-icons text-3xl">hourglass_empty</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Cuenta en Revisión</h1>
        
        {loggingOut ? (
          <div className="flex justify-center items-center gap-2 text-slate-400">
            <span className="material-icons animate-spin">progress_activity</span>
            <p>Cerrando sesión de seguridad...</p>
          </div>
        ) : (
          <>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Tu correo ha sido confirmado, pero <strong>tu cuenta está pendiente de validación por un Administrador</strong>.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              Por razones de seguridad, hemos cerrado tu sesión temporalmente. Recibirás un correo electrónico automático tan pronto como el administrador apruebe tu acceso.
            </p>
            
            <Link 
              href="/"
              className="inline-flex w-full justify-center px-6 py-3 bg-mosque hover:bg-nordic text-white rounded-lg font-medium transition-colors"
            >
              Volver al Inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
