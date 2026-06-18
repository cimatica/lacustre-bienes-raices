import { getDictionary } from '@/lib/i18n';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { createClient } from '@/utils/supabase/server';
import { getUserFavorites } from '@/lib/supabase';
import { formatUF } from '@/lib/currency';
import Link from 'next/link';

export const metadata = {
  title: 'Tus Favoritos | Lacustre - Bienes Raíces',
};

export default async function FavoritesPage() {
  const dict = await getDictionary();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const favorites = user ? await getUserFavorites(user.id) : [];

  const count = favorites.length;
  const subtitle = (dict as any).favorites?.subtitle?.replace('{count}', count.toString()) || `You have ${count} saved properties waiting for you.`;
  const sortByDate = (dict as any).favorites?.sortBy?.replace('{sort}', (dict as any).favorites?.dateAdded || "Date Added") || "Sort by: Date Added";

  return (
    <div className="font-display min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{(dict as any).favorites?.title || "Your Favorites"}</h1>
            <p className="text-slate-400">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-surface-dark px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all border border-slate-700/50 hover:border-mosque/30">
                <span>{sortByDate}</span>
                <span className="material-icons text-lg">keyboard_arrow_down</span>
              </button>
            </div>
            <div className="flex bg-surface-dark rounded-lg p-1 shadow-sm border border-slate-700/50">
              <button className="p-1.5 rounded text-mosque bg-surface-darker">
                <span className="material-icons text-xl">grid_view</span>
              </button>
              <button className="p-1.5 rounded text-slate-500 hover:text-slate-300">
                <span className="material-icons text-xl">view_list</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {favorites.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-400 text-lg">No has guardado ninguna propiedad aún.</p>
            </div>
          )}
          {favorites.map(fav => {
            const property = fav.property;
            if (!property) return null;
            return (
              <div key={fav.id} className="group bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-700/50 flex flex-col h-full">
                <Link href={`/propiedad/${property.slug}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={property.images?.[0] || 'https://via.placeholder.com/400'} />
                    <button className="absolute top-3 right-3 p-2 bg-mosque backdrop-blur-sm rounded-full text-white hover:bg-mosque-dark transition-colors shadow-sm z-10">
                      <span className="material-icons text-xl block">favorite</span>
                    </button>
                    <div className="absolute bottom-3 left-3 bg-surface-darkest/90 backdrop-blur-md px-3 py-1 rounded-md z-10">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">{(dict as any).favorites?.newListing || "New Listing"}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{formatUF(property.price)}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-surface-darker text-mosque border border-slate-700/50">{(dict as any).favorites?.forSale || "For Sale"}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-1">{property.location}</p>
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-6">
                    <div className="flex items-center gap-1"><span className="material-icons text-mosque text-base">bed</span><span>{property.beds} {dict.filters?.beds || "Beds"}</span></div>
                    <div className="flex items-center gap-1"><span className="material-icons text-mosque text-base">bathtub</span><span>{property.baths} {dict.filters?.baths || "Baths"}</span></div>
                    <div className="flex items-center gap-1"><span className="material-icons text-mosque text-base">square_foot</span><span>{property.area} sqm</span></div>
                  </div>
                  <div className="mt-auto">
                    <Link href={`/propiedad/${property.slug}/visita`} className="w-full py-2.5 rounded-lg border border-mosque text-mosque font-medium text-sm hover:bg-mosque hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                      <span>{(dict as any).favorites?.bookVisit || "Book Visit"}</span>
                      <span className="material-icons text-base">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Discover More Card */}
          <div className="group bg-surface-darker/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2 border-dashed border-slate-700/50 hover:border-mosque flex flex-col h-full items-center justify-center min-h-[400px] cursor-pointer text-center p-6">
            <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-icons text-mosque text-3xl">add</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{(dict as any).favorites?.discoverMore || "Discover More"}</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-[200px]">{(dict as any).favorites?.discoverDesc || "Find more properties that match your lifestyle."}</p>
            <button className="px-6 py-2.5 rounded-lg bg-mosque text-white font-medium text-sm shadow-lg shadow-mosque/30 hover:shadow-mosque/50 transition-all">
              {(dict as any).favorites?.browseListings || "Browse Listings"}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
