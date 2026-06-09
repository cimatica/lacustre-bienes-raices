import Link from "next/link";
import { getDictionary, getCurrentLanguage } from "../../lib/i18n";
import LanguageSelector from "./LanguageSelector";
import { createClient } from "@/utils/supabase/server";

export default async function Navbar() {
  const dict = await getDictionary();
  const currentLanguage = await getCurrentLanguage();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">Lacustre - Bienes Raíces</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="#">{dict.navbar.buy}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{dict.navbar.rent}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{dict.navbar.sell}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{dict.navbar.saved}</Link>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector currentLanguage={currentLanguage} />
            <button className="text-nordic-dark hover:text-mosque transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            {user ? (
              <button className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2">
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex items-center justify-center">
                  {user.user_metadata?.avatar_url ? (
                    <img alt="Perfil" className="w-full h-full object-cover" src={user.user_metadata.avatar_url} />
                  ) : (
                    <span className="material-icons text-gray-500">person</span>
                  )}
                </div>
              </button>
            ) : (
              <div className="pl-2 border-l border-nordic-dark/10 ml-2 flex items-center">
                <Link href="/login" className="text-sm font-medium text-mosque hover:text-nordic-dark transition-colors">
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10" href="#">{dict.navbar.buy}</Link>
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{dict.navbar.rent}</Link>
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{dict.navbar.sell}</Link>
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{dict.navbar.saved}</Link>
        </div>
      </div>
    </nav>
  );
}
