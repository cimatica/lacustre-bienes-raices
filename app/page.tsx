import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import PropertyCard from "./components/PropertyCard";
import Pagination from "./components/Pagination";
import { getFeaturedProperties, getNewProperties } from "../lib/supabase";
import { Suspense } from "react";
import Link from "next/link";

const PAGE_SIZE = 8;

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;

  // Parse pagination and filter params from the URL
  const pageParam = resolvedSearchParams.page;
  const page = Math.max(1, parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam ?? "1", 10));

  const saleTypeParam = resolvedSearchParams.tipo;
  const saleTypeRaw = Array.isArray(saleTypeParam) ? saleTypeParam[0] : saleTypeParam;
  const saleType =
    saleTypeRaw === "Venta" || saleTypeRaw === "Renta" ? saleTypeRaw : undefined;

  // Fetch data in parallel on the server
  const [featured, newProperties] = await Promise.all([
    getFeaturedProperties(3),
    getNewProperties(page, PAGE_SIZE, saleType),
  ]);

  const activeTab = saleType ?? "Todos";

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSection />

        {/* Featured Collections Section */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-mosque">Colecciones Destacadas</h2>
              <p className="text-nordic-muted mt-1 text-sm">Propiedades seleccionadas cuidadosamente para el ojo exigente.</p>
            </div>
            <Link
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
              href="/colecciones-destacadas"
            >
              Ver todas <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} variant="featured" />
            ))}
          </div>
        </section>

        {/* New in Market Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-mosque">Nuevos en el Mercado</h2>
              <p className="text-nordic-muted mt-1 text-sm">
                Nuevas oportunidades añadidas esta semana.
                {newProperties.total > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mosque/10 text-mosque">
                    {newProperties.total} propiedades
                  </span>
                )}
              </p>
            </div>
            {/* Filter tabs — server-driven via URL */}
            <div className="hidden md:flex bg-white p-1 rounded-lg shadow-sm border border-nordic-dark/5">
              {(["Todos", "Venta", "Renta"] as const).map((tab) => (
                <Link
                  key={tab}
                  href={tab === "Todos" ? "/?page=1" : `/?tipo=${tab}&page=1`}
                  id={`filter-tab-${tab.toLowerCase()}`}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                    ? "bg-nordic-dark text-white shadow-sm"
                    : "text-nordic-muted hover:text-nordic-dark"
                    }`}
                >
                  {tab}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newProperties.data.map((property) => (
              <PropertyCard key={property.id} property={property} variant="standard" />
            ))}
          </div>

          {newProperties.data.length === 0 && (
            <div className="py-20 text-center text-nordic-muted">
              <span className="material-icons text-5xl mb-4 block opacity-30">home_work</span>
              No hay propiedades disponibles con ese filtro.
            </div>
          )}

          {/* Server-side pagination */}
          <Suspense fallback={null}>
            <Pagination
              currentPage={newProperties.page}
              totalPages={newProperties.totalPages}
            />
          </Suspense>
        </section>
      </main>
    </>
  );
}
