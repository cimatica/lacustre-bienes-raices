import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug, Property, PropertyImage } from '@/lib/supabase';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import PropertyFeatures from '@/app/propiedad/components/PropertyFeatures';
import PropertyDescription from '@/app/propiedad/components/PropertyDescription';
import PropertyAmenities from '@/app/propiedad/components/PropertyAmenities';
import ImageGallery from '@/app/propiedad/components/ImageGallery';
import ContactCard from '@/app/propiedad/components/ContactCard';
import PropertyMap from '@/app/propiedad/components/PropertyMap';
import { getDictionary } from '@/lib/i18n';
import { getUfValue, formatUF, formatCLP } from '@/lib/currency';
import { createClient } from '@/utils/supabase/server';
import { getUserFavorites } from '@/lib/supabase';
import { getRelation } from '@/utils/getRelation';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const property = await getPropertyBySlug(decodedSlug);

  if (!property) {
    return { title: 'Propiedad no encontrada | Lacustre - Bienes Raíces' };
  }

  return {
    title: `${property.title} en ${property.location} - ${formatUF(property.price)}`,
    description: `Propiedad de ${property.beds}D/${property.baths}B en ${property.location}. Precio: ${formatUF(property.price)}`,
    openGraph: {
      images: [property.image_url],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const resolvedParams = await params;
  const dict = await getDictionary();
  const ufValue = await getUfValue();
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const property = await getPropertyBySlug(decodedSlug);

  if (!property) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  let userRole = 'usuario';
  let isFavorite = false;
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_types(name)')
      .eq('id', user.id)
      .maybeSingle();
    if (roleData && roleData.role_types) {
      userRole = getRelation(roleData.role_types)?.name || userRole;
    }
    const favorites = await getUserFavorites(user.id, token);
    isFavorite = favorites.some((f: any) => f.property_id === property.id);
  }

  const isOwner = user ? property.property_assignments?.some(
    (a: any) => a.user_id === user.id && getRelation(a.role_types)?.name === 'vendedor'
  ) : false;

  // Always include the main image url, and append gallery images if they exist
  const mainImageObj = {
    id: 'main',
    property_id: property.id,
    image_url: property.image_url,
    image_alt: property.image_alt || "Main property image",
    is_main: true,
    order_index: 0,
    created_at: property.created_at
  };

  const imagesToPass = property.property_images && property.property_images.length > 0 
    ? [mainImageObj, ...property.property_images] 
    : [mainImageObj];

  return (
    <div className="min-h-screen selection:bg-mosque/20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-mosque font-medium mb-2 uppercase tracking-wide text-sm">
                <span>{(() => {
                  const typeName = getRelation(property.property_types)?.name;
                  return typeName ? (dict.hero?.types?.[typeName as keyof typeof dict.hero.types] || typeName) : "";
                })()}</span>
                {property.sale_type && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-mosque/40"></span>
                    <span>{property.sale_type === "Venta" ? dict.home?.sale : dict.home?.rent}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{property.title}</h1>
            </div>
            <ImageGallery 
              images={imagesToPass} 
              badge={property.badge} 
              propertyId={property.id}
              userId={user?.id}
              initialIsFavorite={isFavorite}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <ContactCard 
                price={property.price} 
                clpPrice={property.price * ufValue} 
                location={property.location} 
                slug={property.slug} 
                isOwner={isOwner} 
                userRole={userRole} 
                dict={dict} 
                commercialStatus={property.commercial_statuses?.name}
                assignments={property.property_assignments}
                userId={user?.id}
              />
              <PropertyMap latitude={property.latitude} longitude={property.longitude} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <PropertyFeatures area={property.area} beds={property.beds} baths={property.baths} parking={property.parking} dict={dict} />
            <PropertyDescription dict={dict} description={property.description || ""} />
            <PropertyAmenities dict={dict} amenities={property.amenities} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
