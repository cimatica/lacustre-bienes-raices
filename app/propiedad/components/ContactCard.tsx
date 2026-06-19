"use client";

import Image from "next/image";
import Link from "next/link";
import { formatUF, formatCLP } from "@/lib/currency";

type Props = {
  price: number;
  clpPrice: number;
  location: string;
  slug: string;
  isOwner?: boolean;
  userRole?: string;
  dict?: any;
  commercialStatus?: string;
};

export default function ContactCard({ price, clpPrice, location, slug, isOwner, userRole, dict, commercialStatus }: Props) {
  const isAvailable = !commercialStatus || commercialStatus === 'Disponible';

  return (
    <div className="bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-700/50">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-display font-bold text-white leading-tight">{formatUF(price)}</h1>
          {!isAvailable && (
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
              commercialStatus === 'Vendida' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              commercialStatus === 'Arrendada' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              'bg-orange-500/10 text-orange-400 border-orange-500/20'
            }`}>
              {commercialStatus}
            </span>
          )}
        </div>
        <p className="text-xl font-medium text-slate-400 mb-2">{formatCLP(clpPrice)}</p>
        <p className="text-slate-400 font-medium flex items-center gap-1">
          <span className="material-icons text-mosque text-sm">location_on</span>
          {location}
        </p>
      </div>
      <div className="h-px bg-slate-700/50 my-6"></div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-800 shadow-sm">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w"
            alt="Sarah Jenkins"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-white">Sarah Jenkins</h3>
          <div className="flex items-center gap-1 text-xs text-mosque font-medium">
            <span className="material-icons text-[14px]">star</span>
            <span>{dict?.property?.topRatedAgent || "Top Rated Agent"}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors">
            <span className="material-icons text-sm">chat</span>
          </button>
          <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors">
            <span className="material-icons text-sm">call</span>
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {isOwner && userRole === 'vendedor' ? (
          <Link href={`/admin/properties`} className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
            <span className="material-icons text-xl group-hover:scale-110 transition-transform">edit</span>
            {(dict as any).seller?.editProperty || "Edit Property"}
          </Link>
        ) : !isAvailable ? (
          <div className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-400 py-4 px-6 rounded-lg font-medium flex flex-col items-center justify-center text-center gap-1.5 cursor-not-allowed">
            <span className="material-icons text-xl opacity-60">lock</span>
            <span className="text-sm">Esta propiedad ya no está disponible</span>
          </div>
        ) : (
          <>
            <Link href={`/propiedad/${slug}/visita`} className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
              <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
              {dict?.property?.scheduleVisit || "Schedule Visit"}
            </Link>
            <button className="w-full bg-transparent border border-slate-700/50 hover:border-mosque text-slate-300 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <span className="material-icons text-xl">mail_outline</span>
              {dict?.property?.contactAgent || "Contact Agent"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
