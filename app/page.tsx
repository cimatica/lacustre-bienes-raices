import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import PropertyCard from "./components/PropertyCard";
import Pagination from "./components/Pagination";
import { getFeaturedProperties, getNewProperties } from "../lib/supabase";
import { Suspense } from "react";
import Link from "next/link";
import { getDictionary } from "../lib/i18n";

const PAGE_SIZE = 8;

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary();

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
              <h2 className="text-2xl font-bold text-white">{dict.home.featuredCollections}</h2>
              <p className="text-slate-400 mt-1 text-sm">{dict.home.featuredSubtitle}</p>
            </div>
            <Link
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
              href="/colecciones-destacadas"
            >
              {dict.home.viewAll} <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} variant="featured" dict={dict} />
            ))}
          </div>
        </section>

        {/* New in Market Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">{dict.home.newInMarket}</h2>
              <p className="text-slate-400 mt-1 text-sm">
                {dict.home.newSubtitle}
                {newProperties.total > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mosque/10 text-mosque">
                    {newProperties.total} {dict.home.propertiesCount}
                  </span>
                )}
              </p>
            </div>
            {/* Filter tabs — server-driven via URL */}
            <div className="hidden md:flex bg-surface-darker p-1 rounded-lg shadow-sm border border-slate-800">
              {(["Todos", "Venta", "Renta"] as const).map((tab) => {
                const label = tab === "Todos" ? dict.home.all : tab === "Venta" ? dict.home.sale : dict.home.rent;
                return (
                  <Link
                    key={tab}
                    href={tab === "Todos" ? "/?page=1" : `/?tipo=${tab}&page=1`}
                    id={`filter-tab-${tab.toLowerCase()}`}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                      ? "bg-mosque text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newProperties.data.map((property) => (
              <PropertyCard key={property.id} property={property} variant="standard" dict={dict} />
            ))}
          </div>

          {newProperties.data.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              <span className="material-icons text-5xl mb-4 block opacity-30">home_work</span>
              {dict.home.noProperties}
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
      <Footer />
    </>
  );
}
