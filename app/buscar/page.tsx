import { Suspense } from "react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import { searchProperties } from "../../lib/supabase";
import Link from "next/link";

interface BuscarProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BuscarPage({ searchParams }: BuscarProps) {
  const resolvedParams = await searchParams;

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

  const results = await searchProperties({
    q,
    ubicacion,
    minPrice,
    maxPrice,
    tipoPropiedad,
    beds,
    baths,
    amenities,
  });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-nordic-muted hover:text-mosque mb-4 transition-colors">
            <span className="material-icons text-sm mr-1">arrow_back</span> Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-mosque">
            Resultados de Búsqueda
          </h1>
          <p className="text-nordic-muted mt-2">
            {results.length === 1 
              ? "Se encontró 1 propiedad." 
              : `Se encontraron ${results.length} propiedades.`}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((property) => (
              <PropertyCard key={property.id} property={property} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-xl shadow-sm border border-nordic-dark/5">
            <span className="material-icons text-6xl text-nordic-muted/30 mb-4 block">search_off</span>
            <h3 className="text-lg font-semibold text-mosque mb-2">No se encontraron propiedades</h3>
            <p className="text-nordic-muted max-w-md mx-auto">
              Intenta ajustar tus filtros de búsqueda, reducir el número de comodidades requeridas o ampliar el rango de precio.
            </p>
            <Link href="/" className="mt-6 inline-block bg-mosque hover:bg-mosque/90 text-white font-medium px-6 py-2 rounded-lg transition-colors">
              Limpiar Búsqueda
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
