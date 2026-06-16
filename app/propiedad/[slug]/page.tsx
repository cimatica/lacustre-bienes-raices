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
    <div className="bg-clear-day text-nordic min-h-screen selection:bg-mosque/20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-mosque font-medium mb-2 uppercase tracking-wide text-sm">
                <span>{property.property_types?.name ? (dict.hero?.types?.[property.property_types.name] || property.property_types.name) : ""}</span>
                {property.sale_type && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-mosque/40"></span>
                    <span>{property.sale_type === "Venta" ? dict.home?.sale : dict.home?.rent}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-nordic-dark">{property.title}</h1>
            </div>
            <ImageGallery images={imagesToPass} badge={property.badge} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <ContactCard price={property.price} clpPrice={property.price * ufValue} location={property.location} dict={dict} />
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
            
            <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
                  <span className="material-icons">calculate</span>
                </div>
                <div>
                  <h3 className="font-semibold text-nordic">{dict.property.estimatedPayment}</h3>
                  <p className="text-sm text-nordic/60">{dict.property.startingFrom} <strong className="text-mosque">$5,430{dict.propertyCard.month}</strong> {dict.property.with20Down}</p>
                </div>
              </div>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic">
                {dict.property.calculateMortgage}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
