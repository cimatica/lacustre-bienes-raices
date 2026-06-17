"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
    
    // Check if the error is related to network/offline
    const errorMessage = error.message?.toLowerCase() || "";
    if (
      errorMessage.includes("fetch failed") || 
      errorMessage.includes("enotfound") || 
      errorMessage.includes("network error") ||
      !navigator.onLine
    ) {
      setIsOffline(true);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <img src="/img/logo.png" alt="Logo" className="h-20 w-auto object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-[#19322F] mb-3">
          {isOffline ? "Sin Conexión a Internet" : "¡Ups! Algo salió mal"}
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {isOffline 
            ? "Parece que no tienes conexión a internet o los servidores no están accesibles. Verifica tu conexión e intenta de nuevo." 
            : "Ocurrió un error inesperado al cargar esta página. El equipo técnico ha sido notificado."}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-[#006655] text-white rounded-lg font-medium hover:bg-[#004d40] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-icons text-sm">refresh</span>
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="w-full py-3 bg-gray-50 text-[#19322F] border border-gray-200 rounded-lg font-medium hover:bg-gray-100 transition-colors block text-center"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
