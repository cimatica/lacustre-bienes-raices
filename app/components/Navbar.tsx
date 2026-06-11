import Link from "next/link";
import { getDictionary, getCurrentLanguage } from "../../lib/i18n";
import LanguageSelector from "./LanguageSelector";
import { createClient } from "@/utils/supabase/server";

export default async function Navbar() {
  const dict = await getDictionary();
  const currentLanguage = await getCurrentLanguage();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = 'usuario';
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (roleData) {
      userRole = roleData.role;
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <img src="/img/logo_navbar.png" alt="Logo" className="h-9 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 ease-out" />
            <div className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-mosque to-nordic-dark">
                Lacustre
              </span>
              <span className="mx-2 text-nordic-dark/20 font-light text-xl mb-0.5">|</span>
              <span className="text-[0.65rem] font-bold tracking-[0.15em] text-nordic-dark/70 uppercase mt-1 hidden sm:inline-block">
                Bienes Raíces
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="#">{dict.navbar.buy}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{dict.navbar.rent}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{dict.navbar.sell}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{dict.navbar.saved}</Link>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector currentLanguage={currentLanguage} />

            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2 relative group py-2">
                <button className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex items-center justify-center cursor-pointer">
                  {user.user_metadata?.avatar_url ? (
                    <img alt="Perfil" className="w-full h-full object-cover" src={user.user_metadata.avatar_url} />
                  ) : (
                    <span className="material-icons text-gray-500">person</span>
                  )}
                </button>
                <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 min-w-[220px] z-50 translate-y-[-10px] group-hover:translate-y-0">
                  <div className="bg-white shadow-soft rounded-xl overflow-hidden border border-gray-100 p-1.5 flex flex-col">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
                      <p className="text-xs text-nordic-dark/50 font-medium uppercase tracking-wider mb-0.5">{dict.auth?.loggedInAs || "Conectado como"}</p>
                      <p className="text-sm text-nordic-dark font-medium truncate">
                        {user.email}
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 capitalize">
                          {userRole}
                        </span>
                      </div>
                    </div>
                    {userRole === 'administrador' && (
                      <Link href="/admin/properties" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                        <span className="material-icons text-[18px]">admin_panel_settings</span>
                        Panel Admin
                      </Link>
                    )}
                    <form action="/auth/signout" method="post" className="w-full">
                      <button type="submit" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        {dict.auth?.logout || "Cerrar sesión"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pl-2 border-l border-nordic-dark/10 ml-2 flex items-center">
                <Link href="/login" className="text-sm font-medium text-mosque hover:text-nordic-dark transition-colors">
                  {dict.auth?.login || "Entrar"}
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
