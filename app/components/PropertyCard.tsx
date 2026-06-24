import { Property } from "../../lib/supabase";
import Link from "next/link";
import { getUfValue, formatUF, formatCLP } from "../../lib/currency";
import FavoriteButton from "./FavoriteButton";

interface PropertyCardProps {
  property: Property;
  variant?: "featured" | "standard";
  dict?: any; // Accepting dict prop for translations
  userId?: string;
  isFavorite?: boolean;
}

export default async function PropertyCard({ property, variant = "standard", dict, userId, isFavorite = false }: PropertyCardProps) {
  const ufValue = await getUfValue();
  const clpValue = property.price * ufValue;

  if (variant === "featured") {
    return (
      <Link href={`/propiedad/${property.slug}`} className="group relative rounded-xl overflow-hidden shadow-soft bg-surface-dark border border-slate-800 cursor-pointer block">
        <div className="aspect-[4/3] w-full overflow-hidden relative">
          <img
            alt={property.image_alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={property.image_url}
          />
          <div className="absolute top-4 left-4 bg-surface-darkest/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white">
            {property.badge}
          </div>
          <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface-darkest/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-mosque transition-all">
            <FavoriteButton propertyId={property.id} userId={userId} initialIsFavorite={isFavorite} />
          </div>
          {/* Gradient overlay */}
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        </div>
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-2 gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-medium text-white group-hover:text-mosque transition-colors truncate">
                {property.title}
              </h3>
              <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                <span className="material-icons text-sm shrink-0">place</span> 
                <span className="truncate">{property.location}</span>
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xl font-bold text-mosque">{formatUF(property.price)}</span>
              <span className="text-sm font-medium text-slate-500">{formatCLP(clpValue)}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="material-icons text-lg">king_bed</span> {property.beds}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="material-icons text-lg">bathtub</span> {property.baths}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="material-icons text-lg">square_foot</span> {property.area} m²
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Normal Card (New in Market)
  return (
    <Link href={`/propiedad/${property.slug}`} className="bg-surface-dark border border-slate-800 rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          alt={property.image_alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={property.image_url}
        />
        <div className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-surface-darkest/90 backdrop-blur-sm rounded-full hover:bg-mosque text-white transition-colors">
          <FavoriteButton propertyId={property.id} userId={userId} initialIsFavorite={isFavorite} />
        </div>
        <div
          className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${
            property.sale_type === "Venta" ? "bg-surface-darkest/90 backdrop-blur-sm" : "bg-mosque/90 backdrop-blur-sm"
          }`}
        >
          {property.badge}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex flex-col">
            <h3 className="font-bold text-xl text-white leading-tight">
              {formatUF(property.price)}
              {property.price_per_month && (
                <span className="text-sm font-normal text-slate-500 ml-1">{dict?.propertyCard?.month || "/mes"}</span>
              )}
            </h3>
            <span className="text-sm font-medium text-slate-500">{formatCLP(clpValue)}</span>
          </div>
        </div>
        <h4 className="text-white font-medium truncate mb-1">{property.title}</h4>
        <p className="text-slate-400 text-xs mb-4 truncate">{property.location}</p>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span className="material-icons text-sm text-mosque/80">king_bed</span> {property.beds}
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span className="material-icons text-sm text-mosque/80">bathtub</span> {property.baths}
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.area}m²
          </div>
        </div>
      </div>
    </Link>
  );
}
