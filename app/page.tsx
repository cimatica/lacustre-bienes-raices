import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import PropertyCard from "./components/PropertyCard";
import { featuredProperties, newInMarketProperties } from "./data/mockProperties";
import Link from "next/link";

export default function Home() {
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
              <p className="text-nordic-muted mt-1 text-sm">Propiedades curadas para el ojo exigente.</p>
            </div>
            <Link className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity" href="#">
              Ver todas <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {/* New in Market Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-mosque">Nuevos en el Mercado</h2>
              <p className="text-nordic-muted mt-1 text-sm">Nuevas oportunidades añadidas esta semana.</p>
            </div>
            <div className="hidden md:flex bg-white p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">Todos</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">Comprar</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">Rentar</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newInMarketProperties.map((property, index) => (
              <div 
                key={property.id}
                className={
                  // Ocultar algunas tarjetas en diferentes breakpoints según el diseño de referencia
                  index === 4 ? "hidden xl:flex" : 
                  index === 5 ? "hidden lg:flex" : ""
                }
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark font-medium rounded-lg transition-all hover:shadow-md">
              Cargar más propiedades
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
