import { createClient } from '@/utils/supabase/server';
import { formatUF } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#19322F]">Propiedades</h1>
        <button className="bg-[#006655] hover:bg-[#004d40] text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Nueva Propiedad
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
            <tr>
              <th className="py-4 px-6 font-semibold">Título</th>
              <th className="py-4 px-6 font-semibold">Ubicación</th>
              <th className="py-4 px-6 font-semibold">Precio (UF)</th>
              <th className="py-4 px-6 font-semibold">Tipo</th>
              <th className="py-4 px-6 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {properties?.map((prop: any) => (
              <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {prop.image_url && (
                      <img src={prop.image_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                    )}
                    <span className="font-medium text-gray-900">{prop.title}</span>
                  </div>
                </td>
                <td className="py-4 px-6">{prop.location}</td>
                <td className="py-4 px-6 font-medium text-gray-900">{formatUF(prop.price)}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${prop.sale_type === 'Venta' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    {prop.sale_type}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-[#006655] transition-colors p-1">
                    <span className="material-icons text-[20px]">edit</span>
                  </button>
                </td>
              </tr>
            ))}
            {(!properties || properties.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No hay propiedades registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
