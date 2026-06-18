'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SuspendedAccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(true);

  useEffect(() => {
    const forceLogout = async () => {
      await supabase.auth.signOut();
      setLoggingOut(false);
    };
    forceLogout();
  }, []);

  return (
    <div className="min-h-screen bg-surface-darkest flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-darker p-8 rounded-2xl shadow-xl border border-red-900/50 text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto mb-6">
          <span className="material-icons text-3xl">block</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Cuenta Suspendida</h1>
        
        {loggingOut ? (
          <div className="flex justify-center items-center gap-2 text-slate-400">
            <span className="material-icons animate-spin">progress_activity</span>
            <p>Cerrando sesión de seguridad...</p>
          </div>
        ) : (
          <>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Tu cuenta ha sido <strong>suspendida</strong> por un administrador debido a una posible infracción de nuestras políticas o por motivos de seguridad.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              No puedes acceder a la plataforma en este momento. Si crees que esto es un error, por favor contacta al equipo de soporte.
            </p>
            
            <Link 
              href="/"
              className="inline-flex w-full justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Volver al Inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
