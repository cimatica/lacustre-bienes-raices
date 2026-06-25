import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { searchProperties, getUserFavorites } from "../../lib/supabase";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { getDictionary } from "../../lib/i18n";
import SortDropdown from "../components/SortDropdown";

interface BuscarProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BuscarPage({ searchParams }: BuscarProps) {
  const resolvedParams = await searchParams;
  const dict = await getDictionary();

  // Extract params
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const ubicacion = typeof resolvedParams.ubicacion === "string" ? resolvedParams.ubicacion : undefined;
  const minPrice = typeof resolvedParams.minPrice === "string" ? resolvedParams.minPrice : undefined;
  const maxPrice = typeof resolvedParams.maxPrice === "string" ? resolvedParams.maxPrice : undefined;
  const tipoPropiedad = typeof resolvedParams.tipoPropiedad === "string" ? resolvedParams.tipoPropiedad : undefined;
  const beds = typeof resolvedParams.beds === "string" ? resolvedParams.beds : undefined;
  const baths = typeof resolvedParams.baths === "string" ? resolvedParams.baths : undefined;
  const amenitiesParam = typeof resolvedParams.amenities === "string" ? resolvedParams.amenities : undefined;
  const amenities = amenitiesParam ? amenitiesParam.split(',') : undefined;
  const typeParam = typeof resolvedParams.type === "string" ? resolvedParams.type : undefined;
  const sort = typeof resolvedParams.sort === "string" ? resolvedParams.sort : undefined;

  // Map "Arriendo" URL parameter to "Renta" database value
  const sale_type = typeParam === "Arriendo" ? "Renta" : (typeParam === "Venta" ? "Venta" : undefined);

  const results = await searchProperties({
    q,
    ubicacion,
    minPrice,
    maxPrice,
    tipoPropiedad,
    beds,
    baths,
    amenities,
    sort,
    sale_type,
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const favorites = user ? await getUserFavorites(user.id) : [];
  const favoritesMap = new Set(favorites.map((f: any) => f.property_id));

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-nordic-muted hover:text-mosque mb-4 transition-colors">
            <span className="material-icons text-sm mr-1">arrow_back</span> {dict.search.backToHome}
          </Link>
          <h1 className="text-3xl font-bold text-mosque">
            {dict.search.searchResults}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
            <p className="text-slate-400">
              {results.length === 1 
                ? dict.search.foundOne 
                : dict.search.foundMultiple.replace("{count}", results.length.toString())}
            </p>
            {results.length > 0 && <SortDropdown dict={dict} />}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                variant="standard" 
                dict={dict} 
                userId={user?.id}
                isFavorite={favoritesMap.has(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-dark rounded-xl shadow-sm border border-slate-700/50">
            <span className="material-icons text-6xl text-slate-500 mb-4 block">manage_search</span>
            <h3 className="text-lg font-semibold text-white mb-2">{dict.search.noProperties}</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {dict.search.noPropertiesDesc}
            </p>
            <Link href="/" className="mt-6 inline-block bg-surface-darker hover:bg-mosque border border-slate-700/50 text-white font-medium px-6 py-2 rounded-lg transition-colors">
              {dict.search.clearSearch}
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
