'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorDescription = searchParams.get('error_description');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Error de Autenticación</h1>
      <p className="text-lg mb-4">Ocurrió un problema al intentar iniciar sesión.</p>
      
      {errorDescription && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 max-w-lg w-full break-words border border-red-200">
          <strong>Detalle del error:</strong>
          <p className="mt-2 font-mono text-sm">{errorDescription}</p>
        </div>
      )}
      
      <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
        Volver a intentar
      </Link>
    </div>
  );
}
