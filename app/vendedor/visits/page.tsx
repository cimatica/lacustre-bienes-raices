import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import VisitsList from '@/app/agente/visits/VisitsList';

export const dynamic = 'force-dynamic';

export default async function VendedorVisitsPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch role_type_id for 'vendedor'
  const { data: roleType } = await adminSupabase.from('role_types').select('id').eq('name', 'vendedor').single();

  // Find properties assigned to this seller
  const { data: myAssignments } = await adminSupabase
    .from('property_assignments')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('role_type_id', roleType?.id);

  const myPropertyIds = myAssignments?.map(a => a.property_id) || [];

  let visits: any[] = [];

  if (myPropertyIds.length > 0) {
    const { data: vs } = await adminSupabase
      .from('visits')
      .select(`
        id,
        visit_date,
        status,
        message,
        user_profiles(full_name, email, phone),
        properties!inner(id, title, image_url, location)
      `)
      .in('property_id', myPropertyIds)
      .order('visit_date', { ascending: true });
      
    if (vs) visits = vs;
  }

  return (
    <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#19322F] tracking-tight">Visitas Agendadas</h1>
        <p className="text-gray-500 mt-1">Calendario y listado de reuniones programadas con interesados.</p>
      </div>

      {visits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <span className="material-icons text-3xl">calendar_month</span>
          </div>
          <h3 className="text-lg font-bold text-[#19322F] mb-1">Sin visitas programadas</h3>
          <p className="text-gray-500">Cuando los clientes agenden visitas para tus propiedades, se listarán aquí.</p>
        </div>
      ) : (
        <VisitsList visits={visits} />
      )}
    </main>
  );
}
