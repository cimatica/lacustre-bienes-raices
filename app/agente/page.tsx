import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AgenteDashboard() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch role_type_id for 'agente'
  const { data: roleType } = await adminSupabase.from('role_types').select('id').eq('name', 'agente').maybeSingle();

  // Find properties assigned to this agent
  const { data: myAssignments } = await adminSupabase
    .from('property_assignments')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('role_type_id', roleType?.id);

  const myPropertyIds = myAssignments?.map(a => a.property_id) || [];

  let leadsCount = 0;
  let visitsCount = 0;
  let assignedPropsCount = myPropertyIds.length;
  
  let latestLeads: any[] = [];
  let recentVisits: any[] = [];

  if (myPropertyIds.length > 0) {
    // Count and get latest leads (favorites)
    const { data: favs } = await adminSupabase
      .from('favorites')
      .select('created_at, user_profiles(full_name, email), properties!inner(title)', { count: 'exact' })
      .in('property_id', myPropertyIds)
      .order('created_at', { ascending: false });
    
    if (favs) {
      leadsCount = favs.length;
      latestLeads = favs.slice(0, 5);
    }

    // Count and get latest scheduled visits
    const { data: vs } = await adminSupabase
      .from('visits')
      .select('visit_date, status, user_profiles(full_name), properties!inner(title)', { count: 'exact' })
      .in('property_id', myPropertyIds)
      .eq('status', 'scheduled')
      .order('visit_date', { ascending: true });
      
    if (vs) {
      visitsCount = vs.length;
      recentVisits = vs.slice(0, 5);
    }
  }

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
          <Link href="/agente/leads" className="mt-4 text-sm font-medium text-[#006655] flex items-center">
            Ver bandeja de entrada <span className="material-icons text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
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
          <Link href="/agente/visits" className="mt-4 text-sm font-medium text-[#006655] flex items-center">
            Revisar calendario <span className="material-icons text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
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
          <Link href="/agente/properties" className="mt-4 text-sm font-medium text-[#006655] flex items-center">
            Gestionar portafolio <span className="material-icons text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#19322F]">Últimos Prospectos</h2>
            <Link href="/agente/leads" className="text-sm font-medium text-[#006655] hover:underline">Ver todos</Link>
          </div>
          <div className="flex-grow p-0">
            {latestLeads.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {latestLeads.map((lead, idx) => (
                  <li key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#006655]/10 flex items-center justify-center text-[#006655] font-bold">
                      {lead.user_profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#19322F]">{lead.user_profiles?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">Interesado en: {lead.properties?.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400 text-3xl">inbox</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Tu bandeja está lista</h3>
                <p className="text-sm">Cuando los usuarios envíen solicitudes a través de la plataforma, aparecerán aquí.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#19322F]">Próximas Visitas</h2>
            <Link href="/agente/visits" className="text-sm font-medium text-[#006655] hover:underline">Ir a calendario</Link>
          </div>
          <div className="flex-grow p-0">
            {recentVisits.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentVisits.map((visit, idx) => {
                  const d = new Date(visit.visit_date);
                  return (
                    <li key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                        <span className="text-[10px] uppercase font-bold">{d.toLocaleString('es', { month: 'short' })}</span>
                        <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#19322F] truncate">{visit.properties?.title}</p>
                        <p className="text-xs text-gray-500">Con {visit.user_profiles?.full_name} a las {d.toLocaleString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400 text-3xl">calendar_month</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Sin visitas agendadas</h3>
                <p className="text-sm">Aquí verás las próximas visitas programas por los interesados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
