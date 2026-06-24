"use client";

import Image from "next/image";
import Link from "next/link";
import { formatUF, formatCLP } from "@/lib/currency";
import { useAlert } from "@/app/components/ui/AlertProvider";

type Props = {
  price: number;
  clpPrice: number;
  location: string;
  slug: string;
  isOwner?: boolean;
  userRole?: string;
  dict?: any;
  commercialStatus?: string;
  assignments?: any[];
  userId?: string;
};

export default function ContactCard({ price, clpPrice, location, slug, isOwner, userRole, dict, commercialStatus, assignments, userId }: Props) {
  const isAvailable = !commercialStatus || commercialStatus === 'Disponible';

  // Extract agent and seller from assignments
  const agentAssignment = assignments?.find(a => a.role_types?.name === 'agente');
  const sellerAssignment = assignments?.find(a => a.role_types?.name === 'vendedor');
  
  const { showAlert } = useAlert();

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/569${cleanPhone.slice(-8)}`;
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      showAlert("Enlace Copiado", "El enlace se ha copiado al portapapeles.", "success");
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'email') {
      window.open(`mailto:?subject=Mira esta propiedad&body=${encodeURIComponent(url)}`, '_self');
    }
  };

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
      <div className="flex flex-col gap-4 mb-6">
        {agentAssignment?.user_profiles && (
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-800 shadow-sm">
              <Image
                src={agentAssignment.user_profiles.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(agentAssignment.user_profiles.full_name)}
                alt={agentAssignment.user_profiles.full_name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-white">{agentAssignment.user_profiles.full_name}</h3>
              <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                <span className="material-icons text-[14px]">support_agent</span>
                <span>Agente</span>
              </div>
            </div>
            <div className="ml-auto">
              <a 
                href={userId ? getWhatsAppLink(agentAssignment.user_profiles.phone) : '#'} 
                target={userId ? "_blank" : "_self"}
                onClick={(e) => {
                  if (!userId) {
                    e.preventDefault();
                    showAlert("Inicia sesión", "Debes iniciar sesión para contactar vía WhatsApp", "warning");
                  }
                }}
                className={`p-2 rounded-full flex items-center justify-center transition-colors ${userId ? 'bg-mosque/10 text-mosque hover:bg-mosque hover:text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                title="Contactar vía WhatsApp"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.122.55 4.195 1.597 6.02L.034 24l6.108-1.602A11.966 11.966 0 0 0 12.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm3.87 17.151c-.628 1.76-2.903 2.126-4.043 2.015-1.12-.109-2.997-.831-5.632-3.466-2.635-2.635-3.356-4.512-3.466-5.632-.11-1.14.254-3.415 2.014-4.043.681-.242 1.488.242 1.83.924.363.722.955 2.502.99 2.57.037.066.082.204-.016.398-.103.204-.263.365-.487.608-.224.24-.468.513-.675.696-.226.198-.466.417-.206.864.26.447 1.157 1.91 2.482 3.097 1.71 1.531 3.25 2.062 3.755 2.272.505.21 1.05.158 1.343-.131.294-.289 1.258-1.469 1.595-1.975.337-.506.674-.42 1.127-.25 4.54 1.704 3.048 2.072 2.593 3.328z"/></svg>
              </a>
            </div>
          </div>
        )}
        
        {sellerAssignment?.user_profiles && (
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-800 shadow-sm">
              <Image
                src={sellerAssignment.user_profiles.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(sellerAssignment.user_profiles.full_name)}
                alt={sellerAssignment.user_profiles.full_name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-white">{sellerAssignment.user_profiles.full_name}</h3>
              <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                <span className="material-icons text-[14px]">person</span>
                <span>Vendedor</span>
              </div>
            </div>
            <div className="ml-auto">
              <a 
                href={userId ? getWhatsAppLink(sellerAssignment.user_profiles.phone) : '#'} 
                target={userId ? "_blank" : "_self"}
                onClick={(e) => {
                  if (!userId) {
                    e.preventDefault();
                    showAlert("Inicia sesión", "Debes iniciar sesión para contactar vía WhatsApp", "warning");
                  }
                }}
                className={`p-2 rounded-full flex items-center justify-center transition-colors ${userId ? 'bg-mosque/10 text-mosque hover:bg-mosque hover:text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                title="Contactar vía WhatsApp"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.122.55 4.195 1.597 6.02L.034 24l6.108-1.602A11.966 11.966 0 0 0 12.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm3.87 17.151c-.628 1.76-2.903 2.126-4.043 2.015-1.12-.109-2.997-.831-5.632-3.466-2.635-2.635-3.356-4.512-3.466-5.632-.11-1.14.254-3.415 2.014-4.043.681-.242 1.488.242 1.83.924.363.722.955 2.502.99 2.57.037.066.082.204-.016.398-.103.204-.263.365-.487.608-.224.24-.468.513-.675.696-.226.198-.466.417-.206.864.26.447 1.157 1.91 2.482 3.097 1.71 1.531 3.25 2.062 3.755 2.272.505.21 1.05.158 1.343-.131.294-.289 1.258-1.469 1.595-1.975.337-.506.674-.42 1.127-.25 4.54 1.704 3.048 2.072 2.593 3.328z"/></svg>
              </a>
            </div>
          </div>
        )}
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
            <div className="relative group/share">
              <button className="w-full bg-transparent border border-slate-700/50 hover:border-mosque text-slate-300 hover:text-mosque py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                <span className="material-icons text-xl">share</span>
                Compartir Propiedad
              </button>
              <div className="absolute left-0 bottom-full mb-2 w-full bg-surface-darker border border-slate-700/50 rounded-xl shadow-xl opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all flex flex-col p-2 z-10 translate-y-2 group-hover/share:translate-y-0">
                <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.122.55 4.195 1.597 6.02L.034 24l6.108-1.602A11.966 11.966 0 0 0 12.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm3.87 17.151c-.628 1.76-2.903 2.126-4.043 2.015-1.12-.109-2.997-.831-5.632-3.466-2.635-2.635-3.356-4.512-3.466-5.632-.11-1.14.254-3.415 2.014-4.043.681-.242 1.488.242 1.83.924.363.722.955 2.502.99 2.57.037.066.082.204-.016.398-.103.204-.263.365-.487.608-.224.24-.468.513-.675.696-.226.198-.466.417-.206.864.26.447 1.157 1.91 2.482 3.097 1.71 1.531 3.25 2.062 3.755 2.272.505.21 1.05.158 1.343-.131.294-.289 1.258-1.469 1.595-1.975.337-.506.674-.42 1.127-.25 4.54 1.704 3.048 2.072 2.593 3.328z"/></svg> WhatsApp
                </button>
                <button onClick={() => handleShare('copy')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                  <span className="material-icons text-[16px]">content_copy</span> Copiar Enlace
                </button>
                <button onClick={() => handleShare('twitter')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X (Twitter)
                </button>
                <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
                </button>
                <button onClick={() => handleShare('email')} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                  <span className="material-icons text-[16px]">mail_outline</span> E-mail
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
