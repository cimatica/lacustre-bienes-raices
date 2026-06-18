import { createClient } from '@/utils/supabase/server';
import { formatUF } from '@/lib/currency';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VendedorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Middleware will redirect
  }

  // Fetch properties owned by the seller
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*, property_types(name)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false });

  const activeCount = properties?.filter(p => p.is_active).length || 0;
  const totalCount = properties?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#19322F]">Panel de Vendedor</h1>
          <p className="text-gray-500 mt-1">Gestiona las propiedades que has publicado.</p>
        </div>
        <Link 
          href="/admin/properties/create" 
          className="bg-[#006655] hover:bg-[#004d40] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md inline-flex items-center gap-2 transition-all"
        >
          <span className="material-icons text-base">add</span> Nueva Propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Mis Propiedades</p>
            <p className="text-3xl font-bold text-[#19322F] mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-[#006655]/10 rounded-full flex items-center justify-center text-[#006655]">
            <span className="material-icons">home_work</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Activas</p>
            <p className="text-3xl font-bold text-[#19322F] mt-1">{activeCount}</p>
          </div>
          <div className="w-12 h-12 bg-[#D9ECC8] rounded-full flex items-center justify-center text-[#006655]">
            <span className="material-icons">check_circle</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Visitas Agendadas</p>
            <p className="text-3xl font-bold text-[#19322F] mt-1">0</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <span className="material-icons">event</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#19322F]">Listado de Propiedades</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {error && (
            <div className="p-6 text-red-500">Error al cargar propiedades: {error.message}</div>
          )}
          
          {(!properties || properties.length === 0) && !error ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-gray-400 text-2xl">home</span>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Aún no tienes propiedades publicadas</p>
              <p>Haz clic en "Nueva Propiedad" para comenzar a publicar.</p>
            </div>
          ) : (
            properties?.map(prop => (
              <div key={prop.id} className="p-6 flex flex-col md:flex-row gap-6 items-center hover:bg-gray-50 transition-colors">
                <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {prop.image_url ? (
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="material-icons">image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#19322F]">{prop.title}</h3>
                    <span className="font-bold text-[#006655]">{formatUF(prop.price)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{prop.property_types?.name || 'Propiedad'} en {prop.location}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="material-icons text-[16px]">bed</span> {prop.beds || 0} Camas</span>
                    <span className="flex items-center gap-1.5"><span className="material-icons text-[16px]">bathtub</span> {prop.baths || 0} Baños</span>
                    <span className="flex items-center gap-1.5"><span className="material-icons text-[16px]">square_foot</span> {prop.area || 0} m²</span>
                    <div className="flex-grow"></div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${
                      prop.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {prop.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
