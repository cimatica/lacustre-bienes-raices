import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { getFeaturedProperties } from "../../lib/supabase";
import Link from "next/link";
import { getDictionary } from "../../lib/i18n";

export default async function ColeccionesDestacadas() {
  const featured = await getFeaturedProperties();
  const dict = await getDictionary();

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-nordic-muted hover:text-mosque mb-4 text-sm transition-colors">
            <span className="material-icons text-sm mr-1">arrow_back</span> {dict.search.backToHome}
          </Link>
          <h1 className="text-3xl font-bold text-mosque">{dict.collections.title}</h1>
          <p className="text-nordic-muted mt-2">{dict.collections.subtitle}</p>
        </div>

        {featured.length === 0 ? (
          <div className="py-20 text-center text-nordic-muted bg-white rounded-xl shadow-sm border border-nordic-dark/5">
            <span className="material-icons text-5xl mb-4 block opacity-30">star_border</span>
            {dict.collections.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} variant="featured" dict={dict} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
