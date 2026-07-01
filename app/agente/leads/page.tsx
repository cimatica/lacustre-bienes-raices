import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import LeadList from '@/app/vendedor/leads/LeadList';
import { getRelation } from '@/utils/getRelation';

export const dynamic = 'force-dynamic';

export default async function AgenteLeadsPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch role_type_id for 'agente'
  const { data: roleType } = await adminSupabase.from('role_types').select('id').eq('name', 'agente').maybeSingle();

  // Find properties assigned to this agent
  const { data: myAssignments } = await adminSupabase
    .from('property_assignments')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('role_type_id', roleType?.id);

  const myPropertyIds = myAssignments?.map(a => a.property_id) || [];

  let leads: any[] = [];
  let visits: any[] = [];

  if (myPropertyIds.length > 0) {
    // Get favorites
    const { data: favs } = await adminSupabase
      .from('favorites')
      .select(`
        id,
        created_at,
        user_id,
        property_id,
        user_profiles(id, full_name, email, phone),
        properties!inner(id, title, slug, image_url, location, property_assignments(user_profiles(id, full_name), role_types(name)))
      `)
      .in('property_id', myPropertyIds)
      .order('created_at', { ascending: false });
    
    if (favs) leads = favs;

    // Get visits
    const { data: vs } = await adminSupabase
      .from('visits')
      .select('user_id, property_id, visit_date, status')
      .in('property_id', myPropertyIds);
      
    if (vs) visits = vs;
  }

  // Combine data
  const processedLeads = leads.map(lead => {
    const userVisits = visits.filter(v => v.user_id === lead.user_id && v.property_id === lead.property_id);
    // Find agent for this property
    const agentAssignment = lead.properties.property_assignments.find((a: any) => getRelation(a.role_types)?.name === 'agente');
    
    return {
      id: lead.id,
      created_at: lead.created_at,
      user: lead.user_profiles,
      property: {
        id: lead.properties.id,
        slug: lead.properties.slug,
        title: lead.properties.title,
        image_url: lead.properties.image_url,
        location: lead.properties.location,
        agent: agentAssignment ? agentAssignment.user_profiles : null
      },
      visits: userVisits
    };
  });

  return (
    <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#19322F] tracking-tight">Interesados (Leads)</h1>
        <p className="text-gray-500 mt-1">Prospectos interesados en las propiedades asignadas a tu portafolio.</p>
      </div>

      {processedLeads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <span className="material-icons text-3xl">inbox</span>
          </div>
          <h3 className="text-lg font-bold text-[#19322F] mb-1">Aún no hay interesados</h3>
          <p className="text-gray-500">Cuando los usuarios soliciten información sobre tus propiedades, aparecerán aquí.</p>
        </div>
      ) : (
        <LeadList leads={processedLeads} />
      )}
    </main>
  );
}
