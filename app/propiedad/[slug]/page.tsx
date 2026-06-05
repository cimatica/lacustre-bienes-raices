import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug, Property, PropertyImage } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyFeatures from '@/components/property/PropertyFeatures';
import PropertyDescription from '@/components/property/PropertyDescription';
import PropertyAmenities from '@/components/property/PropertyAmenities';
import ImageGallery from '@/components/property/ImageGallery';
import ContactCard from '@/components/property/ContactCard';

import PropertyMap from '@/components/property/PropertyMap';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let property = await getPropertyBySlug(resolvedParams.slug);
  
  // Only for development visualization if DB is empty
  if (!property && process.env.NODE_ENV === 'development') {
    property = getMockProperty(resolvedParams.slug);
  }

  if (!property) {
    return { title: 'Propiedad no encontrada | LuxeEstate' };
  }

  return {
    title: `${property.title} en ${property.location} - ${property.price}`,
    description: `Propiedad de ${property.beds}D/${property.baths}B en ${property.location}. Precio: ${property.price}`,
    openGraph: {
      images: [property.image_url],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const resolvedParams = await params;
  let property = await getPropertyBySlug(resolvedParams.slug);

  // Mock data fallback for visualization if DB is empty
  if (!property) {
    if (process.env.NODE_ENV === 'development') {
      property = getMockProperty(resolvedParams.slug);
    } else {
      notFound();
    }
  }

  // Use main image url if property_images is empty
  const imagesToPass = property.property_images && property.property_images.length > 0 
    ? property.property_images 
    : [
        {
          id: 'main',
          property_id: property.id,
          image_url: property.image_url,
          image_alt: property.image_alt,
          is_main: true,
          order_index: 0,
          created_at: property.created_at
        }
      ];

  return (
    <div className="bg-clear-day text-nordic min-h-screen selection:bg-mosque/20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            <ImageGallery images={imagesToPass} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <ContactCard price={property.price} location={property.location} />
              <PropertyMap latitude={property.latitude} longitude={property.longitude} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <PropertyFeatures area={property.area} beds={property.beds} baths={property.baths} />
            <PropertyDescription />
            <PropertyAmenities />
            
            <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
                  <span className="material-icons">calculate</span>
                </div>
                <div>
                  <h3 className="font-semibold text-nordic">Estimated Payment</h3>
                  <p className="text-sm text-nordic/60">Starting from <strong className="text-mosque">$5,430/mo</strong> with 20% down</p>
                </div>
              </div>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic">
                Calculate Mortgage
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getMockProperty(slug: string): Property {
  return {
    id: 'mock-id',
    title: 'Modern luxury home',
    location: '1234 Serenity Lane, Palo Alto, CA',
    price: '$1,250,000',
    price_per_month: false,
    beds: 4,
    baths: 3,
    area: 240,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0',
    image_alt: 'Modern luxury house exterior',
    badge: 'Premium',
    is_featured: true,
    type: 'new',
    sale_type: 'Venta',
    created_at: new Date().toISOString(),
    slug: slug,
    latitude: -33.42628,
    longitude: -70.61217,
    property_images: [
       { id: '1', property_id: 'mock-id', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0', image_alt: 'Exterior', is_main: true, order_index: 0, created_at: '' },
       { id: '2', property_id: 'mock-id', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvpJBMaiXUL25hHYwLa_0R6dPhLLM1EuhEt-AVtOy8qSnEi9IcA_RzD5s5ThawY3XG2qw8h4kPqvfP18EY1E5vgA8fs6v7RefCMJ1gY8Gt4uyXGJ85-lcIvL18v8Nlc-U-VOwn1h54yjjg4-KXHt1N5DfuTkQUBdldSELRZeJ6zuZ087NCJ7dDIDaXKJpPgulmd6JC6zD1-Kq00Sb4VXIhVR3IQ1Hd8S6xZkd17QvMHSNqbtKG849PRqHZX3nKLHEWYWWPvbL5_Gs', image_alt: 'Exterior side', is_main: false, order_index: 1, created_at: '' },
       { id: '3', property_id: 'mock-id', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbloTFAmeq6ugmfkwyqn3NMGn11PMk4FU0EIHRHvfYB8nw_-iH5TLps5ig3zipLPoKVZZKO8fOvEVJIwp3MQ9wrS4Dzhgw6ypUDhsycDc-YsboVBbRrXxKOYl-77zNHX9E4hynYyJfVVzXn7ldtURk3Ij3pHIMwqzfDdUxyhYaIJe5dRYa0JN5RpHbPNaV33TcM-IoYW11wNUCKkivtfgC3tk7hkKa3gue7ZTjLhR1ZOE_A1MvMZ3rgBxGDg-HFASH4YP6jI3rwMM', image_alt: 'Living', is_main: false, order_index: 2, created_at: '' },
       { id: '4', property_id: 'mock-id', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRCEooMTK0GZV_7SdAorgeIN1pNz3R9YsLv-2pv39FOje7BUWCWPnKOSA1f6rlYcw7IoJ8NxUp4OU-MAk5_ucnykEtps56-kR6DtQ9JgLlCNyiuazO87fy-xCtXVNROT9kquBZ2JUvUtNGRwWiBaK1DnXOHSxp3ELHbLK8MNS-Ht3Gw8dXgNbya4bZiHZ7C-YnCJfwPjX25zrrQypfbiJsS8jjxFq3--uC264Zbhxp8XCsqDid3BIaJ8RdNMRze6lVvpg49N7Z0tI', image_alt: 'Kitchen', is_main: false, order_index: 3, created_at: '' },
    ]
  };
}
