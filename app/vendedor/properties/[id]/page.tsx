import PropertyForm from '@/app/admin/properties/components/PropertyForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function VendedorEditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (*),
      property_assignments (user_id, role_types(name))
    `)
    .eq('id', resolvedParams.id)
    .maybeSingle();

  if (error || !property) {
    notFound();
  }

  // Ensure current user is the assigned vendedor
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const isMyProperty = property.property_assignments?.some((a: any) => a.user_id === user.id && a.role_types?.name === 'vendedor');
  if (!isMyProperty) {
    // Return notFound or unauthorized if this property does not belong to the seller
    notFound();
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              <li><Link href="/vendedor/properties" className="hover:text-[#006655] transition-colors">Propiedades</Link></li>
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

      <PropertyForm initialData={property} propertyId={property.id} basePath="/vendedor/properties" />
    </main>
  );
}
