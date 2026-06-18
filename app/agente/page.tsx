import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AgenteDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // En el futuro, se consultarán los "leads" o contactos asignados a este agente.
  // Por ahora, mostraremos un dashboard de placeholder muy profesional.
  const leadsCount = 12;
  const visitsCount = 4;
  const assignedPropsCount = 8;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#19322F]">CRM Inmobiliario</h1>
        <p className="text-gray-500 mt-1">Tu centro de gestión de prospectos y propiedades asignadas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#006655] transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Nuevos Leads</p>
              <p className="text-3xl font-bold text-[#19322F] mt-1">{leadsCount}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
              <span className="material-icons">mark_email_unread</span>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-[#006655] flex items-center">
            Ver bandeja de entrada <span className="material-icons text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#006655] transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Visitas Agendadas</p>
              <p className="text-3xl font-bold text-[#19322F] mt-1">{visitsCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
              <span className="material-icons">calendar_month</span>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-[#006655] flex items-center">
            Revisar calendario <span className="material-icons text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#006655] transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Propiedades Asignadas</p>
              <p className="text-3xl font-bold text-[#19322F] mt-1">{assignedPropsCount}</p>
            </div>
            <div className="w-10 h-10 bg-[#006655]/10 rounded-full flex items-center justify-center text-[#006655]">
              <span className="material-icons">apartment</span>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-[#006655] flex items-center">
            Gestionar portafolio <span className="material-icons text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#19322F]">Últimos Prospectos</h2>
            <button className="text-sm font-medium text-[#006655]">Ver todos</button>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-gray-400 text-3xl">inbox</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Tu bandeja está lista</h3>
            <p className="text-sm">Cuando los usuarios envíen solicitudes a través de la plataforma, aparecerán aquí para que les des seguimiento.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#19322F]">Actividad Reciente</h2>
            <button className="text-sm font-medium text-[#006655]">Ver reporte</button>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-gray-400 text-3xl">timeline</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Sin actividad reciente</h3>
            <p className="text-sm">El registro de tus cierres y visitas se graficará aquí automáticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
