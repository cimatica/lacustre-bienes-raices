import PropertyForm from '../components/PropertyForm';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, property_images(*)')
    .eq('id', id)
    .single();

  if (error || !property) {
    redirect('/admin/properties');
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              <li><Link href="/admin/properties" className="hover:text-[#006655] transition-colors">Propiedades</Link></li>
              <li><span className="material-icons text-xs text-gray-400">chevron_right</span></li>
              <li aria-current="page" className="text-[#19322F]">Editar Propiedad</li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#19322F] tracking-tight mb-2">Editar Propiedad</h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal">
              Modifica los datos de la propiedad y guarda los cambios.
            </p>
          </div>
        </div>
      </header>

      <PropertyForm initialData={property} propertyId={property.id} />
    </main>
  );
}
