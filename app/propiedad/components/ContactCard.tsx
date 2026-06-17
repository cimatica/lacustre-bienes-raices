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
};

export default function ContactCard({ price, clpPrice, location, slug, isOwner, userRole, dict }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
      <div className="mb-4">
        <h1 className="text-4xl font-display font-bold text-nordic leading-tight">{formatUF(price)}</h1>
        <p className="text-xl font-medium text-nordic/60 mb-2">{formatCLP(clpPrice)}</p>
        <p className="text-nordic/60 font-medium flex items-center gap-1">
          <span className="material-icons text-mosque text-sm">location_on</span>
          {location}
        </p>
      </div>
      <div className="h-px bg-slate-100 my-6"></div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w"
            alt="Sarah Jenkins"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-nordic">Sarah Jenkins</h3>
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
        ) : (
          <Link href={`/propiedad/${slug}/visita`} className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
            <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
            {dict?.property?.scheduleVisit || "Schedule Visit"}
          </Link>
        )}
        <button className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
          <span className="material-icons text-xl">mail_outline</span>
          {dict?.property?.contactAgent || "Contact Agent"}
        </button>
      </div>
    </div>
  );
}
