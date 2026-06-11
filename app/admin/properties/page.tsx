import { createClient } from '@/utils/supabase/server';
import { formatUF } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  const totalListings = properties?.length || 0;
  const activeProperties = properties?.filter(p => p.status === 'active' || p.status === undefined).length || totalListings; // Default to active
  const pendingSale = 0; // Static for now as we don't have this status

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#19322F] tracking-tight">Mis Propiedades</h1>
          <p className="text-gray-500 mt-1">Gestiona tu portafolio y monitorea el rendimiento.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-[#19322F] hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
            <span className="material-icons text-base">filter_list</span> Filtros
          </button>
          <button className="bg-[#006655] hover:bg-[#004d40] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-[#006655]/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span className="material-icons text-base">add</span> Nueva Propiedad
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-[#006655]/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Propiedades</p>
            <p className="text-2xl font-bold text-[#19322F] mt-1">{totalListings}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#006655]/10 flex items-center justify-center text-[#006655]">
            <span className="material-icons">apartment</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#006655]/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Propiedades Activas</p>
            <p className="text-2xl font-bold text-[#19322F] mt-1">{activeProperties}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#006655]">
            <span className="material-icons">check_circle</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#006655]/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ventas Pendientes</p>
            <p className="text-2xl font-bold text-[#19322F] mt-1">{pendingSale}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <span className="material-icons">pending</span>
          </div>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6">Detalles de la Propiedad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* List Items */}
        {properties?.map((prop: any) => (
          <div key={prop.id} className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-[#EEF6F6] transition-colors items-center">
            {/* Property Details */}
            <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
              <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                {prop.image_url ? (
                  <img src={prop.image_url} alt={prop.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="material-icons">image</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#19322F] group-hover:text-[#006655] transition-colors cursor-pointer">{prop.title}</h3>
                <p className="text-sm text-gray-500">{prop.location}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bed</span> {prop.bedrooms || 0} Camas</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bathtub</span> {prop.bathrooms || 0} Baños</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{prop.surface_area || 0} m²</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-6 md:col-span-2">
              <div className="text-base font-semibold text-[#19322F]">{formatUF(prop.price)}</div>
              <div className="text-xs text-gray-400">{prop.sale_type}</div>
            </div>

            {/* Status */}
            <div className="col-span-6 md:col-span-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#D9ECC8] text-[#006655] border border-[#006655]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006655] mr-1.5"></span>
                Activa
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
              <button className="p-2 rounded-lg text-gray-400 hover:text-[#006655] hover:bg-[#D9ECC8]/30 transition-all" title="Editar Propiedad">
                <span className="material-icons text-xl">edit</span>
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar Propiedad">
                <span className="material-icons text-xl">delete_outline</span>
              </button>
            </div>
          </div>
        ))}
        {(!properties || properties.length === 0) && (
          <div className="py-12 text-center text-gray-500">
            No hay propiedades registradas aún.
          </div>
        )}

        {/* Pagination (Static UI representation) */}
        {properties && properties.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-[#19322F]">1</span> a <span className="font-medium text-[#19322F]">{properties.length}</span> de <span className="font-medium text-[#19322F]">{properties.length}</span> propiedades
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white disabled:opacity-50" disabled>Anterior</button>
              <button className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white disabled:opacity-50" disabled>Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
