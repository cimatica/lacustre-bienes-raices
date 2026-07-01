import { createClient } from '@/utils/supabase/server';
import LeadList from './LeadList';
import { getRelation } from '@/utils/getRelation';

export const dynamic = 'force-dynamic';

export default async function VendedorLeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch role_type_id for 'vendedor'
  const { data: roleType } = await supabase.from('role_types').select('id').eq('name', 'vendedor').maybeSingle();

  // Find properties assigned to this seller
  const { data: myAssignments } = await supabase
    .from('property_assignments')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('role_type_id', roleType?.id);

  const myPropertyIds = myAssignments?.map(a => a.property_id) || [];

  let leads: any[] = [];
  let visits: any[] = [];

  if (myPropertyIds.length > 0) {
    // Get favorites
    const { data: favs } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        user_id,
        property_id,
        user_profiles!inner(id, full_name, email, phone),
        properties!inner(id, title, slug, image_url, location, property_assignments(user_profiles(id, full_name), role_types(name)))
      `)
      .in('property_id', myPropertyIds)
      .order('created_at', { ascending: false });
    
    if (favs) leads = favs;

    // Get visits
    const { data: vs } = await supabase
      .from('visits')
      .select('user_id, property_id, visit_date, status')
      .in('property_id', myPropertyIds);
      
    if (vs) visits = vs;
  }

  // Combine data
  const processedLeads = leads.map(lead => {
    const userVisits = visits.filter(v => v.user_id === lead.user_id && v.property_id === lead.property_id);
    // Fetch role_type_id for 'agente' dynamically inside or outside, but we don't have it here, so we look at the joined role_types(name)
    // Wait, let's fix the query on line 33 first. It was:
    // properties!inner(id, title, image_url, location, property_assignments(role_type_id, user_profiles(id, full_name)))
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
        <p className="text-gray-500 mt-1">Usuarios que han marcado tus propiedades como favoritas.</p>
      </div>

      {processedLeads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <span className="material-icons text-3xl">favorite_border</span>
          </div>
          <h3 className="text-lg font-bold text-[#19322F] mb-1">Aún no hay interesados</h3>
          <p className="text-gray-500">Cuando un usuario marque alguna de tus propiedades como favorita, aparecerá aquí.</p>
        </div>
      ) : (
        <LeadList leads={processedLeads} />
      )}
    </main>
  );
}
