import { createClient } from '@/utils/supabase/server';
import { formatUF } from '@/lib/currency';
import AdminFilters from '@/app/admin/components/AdminFilters';
import AdminPagination from '@/app/admin/components/AdminPagination';
import Link from 'next/link';
import { PropertyActions } from '@/app/admin/properties/components/PropertyActions';
import CommercialStatusDropdown from '@/app/admin/properties/components/CommercialStatusDropdown';
import PropertyAssignments from '@/app/admin/properties/components/PropertyAssignments';

export const dynamic = 'force-dynamic';

export default async function AgentePropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  
  const query = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query : '';
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all';
  const type = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : 'all';
  const commercialStatus = typeof resolvedSearchParams.commercial_status === 'string' ? resolvedSearchParams.commercial_status : 'all';
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'date_desc';
  
  const itemsPerPage = 10;
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Commercial Statuses
  const { data: commercialStatuses } = await supabase.from('commercial_statuses').select('*').order('created_at', { ascending: true });
  
  // Fetch role_type_id for 'agente'
  const { data: roleType } = await supabase.from('role_types').select('id').eq('name', 'agente').maybeSingle();

  // Find properties assigned to this agent
  let myPropertyIds: string[] = [];
  
  if (roleType?.id) {
    const { data: myAssignments } = await supabase
      .from('property_assignments')
      .select('property_id')
      .eq('user_id', user.id)
      .eq('role_type_id', roleType.id);
      
    myPropertyIds = myAssignments?.map(a => a.property_id) || [];
  }

  // Base query for properties
  let propQuery = supabase
    .from('properties')
    .select('*, property_types(id, name), property_assignments(user_id, role_types(name), user_profiles(id, full_name))', { count: 'exact' });
    
  if (myPropertyIds.length > 0) {
    propQuery = propQuery.in('id', myPropertyIds);
  } else {
    // Force empty result if no properties assigned
    propQuery = propQuery.in('id', ['00000000-0000-0000-0000-000000000000']);
  }

  if (query) {
    propQuery = propQuery.ilike('title', `%${query}%`);
  }
  if (status === 'active') {
    propQuery = propQuery.eq('is_active', true);
  } else if (status === 'inactive') {
    propQuery = propQuery.eq('is_active', false);
  }
  if (type !== 'all') {
    propQuery = propQuery.eq('sale_type', type);
  }
  if (commercialStatus !== 'all' && commercialStatuses) {
    const st = commercialStatuses.find((s: any) => s.name === commercialStatus);
    if (st) {
      propQuery = propQuery.eq('commercial_status_id', st.id);
    }
  }
  
  // Apply Sorting
  if (sort === 'price_asc') propQuery = propQuery.order('price', { ascending: true });
  else if (sort === 'price_desc') propQuery = propQuery.order('price', { ascending: false });
  else if (sort === 'status_asc') propQuery = propQuery.order('commercial_status_id', { ascending: true });
  else if (sort === 'status_desc') propQuery = propQuery.order('commercial_status_id', { ascending: false });
  else propQuery = propQuery.order('created_at', { ascending: false }); // date_desc default
  
  const { data: properties, error, count } = await propQuery
    .order('id', { ascending: true })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  let currentUserRole = 'agente';

  // Overall stats (filtered by my properties)
  const { count: totalListings } = await supabase.from('properties').select('*', { count: 'exact', head: true }).in('id', myPropertyIds.length ? myPropertyIds : ['00000000-0000-0000-0000-000000000000']);
  const { count: activeProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true }).in('id', myPropertyIds.length ? myPropertyIds : ['00000000-0000-0000-0000-000000000000']).eq('is_active', true);
  
  const { data: allPropsStats } = await supabase.from('properties').select('commercial_status_id').in('id', myPropertyIds.length ? myPropertyIds : ['00000000-0000-0000-0000-000000000000']);
  
  const statusCounts: Record<string, number> = {
    'Disponible': 0,
    'Vendida': 0,
    'Arrendada': 0,
    'Reservada': 0
  };

  if (allPropsStats && commercialStatuses) {
    const idToNameMap = Object.fromEntries(commercialStatuses.map((s: any) => [s.id, s.name]));
    for (const p of allPropsStats) {
      const name = idToNameMap[p.commercial_status_id];
      if (name && statusCounts[name] !== undefined) {
        statusCounts[name]++;
      }
    }
  }

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  // Filter links to point to /agente
  return (
    <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#19322F] tracking-tight">Portafolio Asignado</h1>
          <p className="text-gray-500 mt-1">Gestiona las propiedades que se te han asignado.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Link href="/agente/properties" className={`bg-white p-4 rounded-xl border ${(status === 'all' && commercialStatus === 'all') ? 'border-[#006655] shadow-md ring-1 ring-[#006655]/20' : 'border-[#006655]/10 shadow-sm hover:border-[#006655]/30 hover:shadow-md'} transition-all flex flex-col justify-between h-full`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
            <div className="h-8 w-8 rounded-full bg-[#006655]/10 flex items-center justify-center text-[#006655]">
              <span className="material-icons text-sm">apartment</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#19322F]">{totalListings || 0}</p>
        </Link>
        <Link href="/agente/properties?status=active" className={`bg-white p-4 rounded-xl border ${status === 'active' ? 'border-[#006655] shadow-md ring-1 ring-[#006655]/20' : 'border-[#006655]/10 shadow-sm hover:border-[#006655]/30 hover:shadow-md'} transition-all flex flex-col justify-between h-full`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Activas</p>
            <div className="h-8 w-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#006655]">
              <span className="material-icons text-sm">visibility</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#19322F]">{activeProperties !== null ? activeProperties : (totalListings || 0)}</p>
        </Link>
        <Link href="/agente/properties?commercial_status=Disponible" className={`bg-white p-4 rounded-xl border ${commercialStatus === 'Disponible' ? 'border-[#006655] shadow-md ring-1 ring-[#006655]/20' : 'border-[#006655]/10 shadow-sm hover:border-[#006655]/30 hover:shadow-md'} transition-all flex flex-col justify-between h-full`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Disponibles</p>
            <div className="h-8 w-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#006655]">
              <span className="material-icons text-sm">check_circle</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#19322F]">{statusCounts['Disponible']}</p>
        </Link>
        <Link href="/agente/properties?commercial_status=Vendida" className={`bg-white p-4 rounded-xl border ${commercialStatus === 'Vendida' ? 'border-[#006655] shadow-md ring-1 ring-[#006655]/20' : 'border-[#006655]/10 shadow-sm hover:border-[#006655]/30 hover:shadow-md'} transition-all flex flex-col justify-between h-full`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Vendidas</p>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <span className="material-icons text-sm">sell</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#19322F]">{statusCounts['Vendida']}</p>
        </Link>
        <Link href="/agente/properties?commercial_status=Arrendada" className={`bg-white p-4 rounded-xl border ${commercialStatus === 'Arrendada' ? 'border-[#006655] shadow-md ring-1 ring-[#006655]/20' : 'border-[#006655]/10 shadow-sm hover:border-[#006655]/30 hover:shadow-md'} transition-all flex flex-col justify-between h-full`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Arrendadas</p>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <span className="material-icons text-sm">key</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#19322F]">{statusCounts['Arrendada']}</p>
        </Link>
        <Link href="/agente/properties?commercial_status=Reservada" className={`bg-white p-4 rounded-xl border ${commercialStatus === 'Reservada' ? 'border-[#006655] shadow-md ring-1 ring-[#006655]/20' : 'border-[#006655]/10 shadow-sm hover:border-[#006655]/30 hover:shadow-md'} transition-all flex flex-col justify-between h-full`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Reservadas</p>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
              <span className="material-icons text-sm">schedule</span>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#19322F]">{statusCounts['Reservada']}</p>
        </Link>
      </div>

      <AdminFilters basePath="/agente/properties" showPersonnelFilters={false} />

      {/* Property List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 bg-gray-50/50 rounded-t-xl border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Detalles de la Propiedad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Personal</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* List Items */}
        {properties?.map((prop: any, index: number) => (
          <div key={prop.id} className={`group grid grid-cols-1 md:grid-cols-12 gap-6 px-6 py-6 border-b border-gray-100 hover:bg-[#EEF6F6] transition-colors items-center ${index === properties.length - 1 ? 'rounded-b-xl border-b-0' : ''}`}>
            {/* Property Details */}
            <div className="col-span-12 md:col-span-4 flex gap-4 items-center">
              <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                {prop.image_url ? (
                  <img src={prop.image_url} alt={prop.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="material-icons">image</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-[#19322F] group-hover:text-[#006655] transition-colors cursor-pointer truncate" title={prop.title}>{prop.title}</h3>
                <p className="text-sm text-gray-500 truncate" title={`${Array.isArray(prop.property_types) ? prop.property_types[0]?.name : prop.property_types?.name || 'Propiedad'} en ${prop.location}`}>{Array.isArray(prop.property_types) ? prop.property_types[0]?.name : prop.property_types?.name || 'Propiedad'} en {prop.location}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400 truncate">
                  <span className="flex items-center gap-1 flex-shrink-0"><span className="material-icons text-[14px]">king_bed</span> {prop.beds || 0} Camas</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                  <span className="flex items-center gap-1 flex-shrink-0"><span className="material-icons text-[14px]">bathtub</span> {prop.baths || 0} Baños</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                  <span className="flex items-center gap-1 flex-shrink-0"><span className="material-icons text-[14px]">directions_car</span> {prop.parking || 0} Estac.</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                  <span className="flex items-center gap-1 flex-shrink-0"><span className="material-icons text-[14px]">square_foot</span> {prop.area || 0} m²</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-6 md:col-span-2">
              <div className="text-base font-semibold text-[#19322F]">{formatUF(prop.price)}</div>
              <div className="text-xs text-gray-400">{prop.sale_type}</div>
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2 flex flex-col gap-2 items-start">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                prop.is_active 
                  ? "bg-[#D9ECC8]/50 text-[#006655] border-[#006655]/20" 
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {prop.is_active ? 'Visible en sitio' : 'Oculta'}
              </span>
              
              <CommercialStatusDropdown 
                propertyId={prop.id} 
                currentStatusId={prop.commercial_status_id} 
                statuses={commercialStatuses || []} 
                disabled={true}
              />
            </div>

            {/* Personal */}
            <div className="col-span-12 md:col-span-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
              <PropertyAssignments 
                propertyId={prop.id} 
                initialAssignments={prop.property_assignments || []} 
                currentUserRole={currentUserRole} 
              />
            </div>

            {/* Actions */}
            <div className="col-span-12 md:col-span-2 text-right flex justify-end items-center">
              <PropertyActions property={prop} currentUserRole={currentUserRole} basePath="/agente/properties" />
            </div>
          </div>
        ))}
        {(!properties || properties.length === 0) && (
          <div className="py-12 text-center text-gray-500">
            {query ? 'No se encontraron propiedades para tu búsqueda.' : 'No tienes propiedades asignadas aún.'}
          </div>
        )}
      </div>
      
      <AdminPagination currentPage={page} totalPages={totalPages} totalItems={count || 0} basePath="/agente/properties" />
    </main>
  );
}
