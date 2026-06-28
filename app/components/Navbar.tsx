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
  let avatarUrl = user?.user_metadata?.avatar_url;
  let userName = '';

  if (user) {
    const [roleRes, profileRes] = await Promise.all([
      supabase.from('user_roles').select('role_types(name)').eq('id', user.id).maybeSingle(),
      supabase.from('user_profiles').select('avatar_url, full_name').eq('id', user.id).maybeSingle()
    ]);

    if (roleRes.data?.role_types) {
      userRole = roleRes.data.role_types.name;
    }
    
    if (profileRes.data?.full_name) {
      userName = profileRes.data.full_name;
    }

    if (profileRes.data?.avatar_url) {
      avatarUrl = profileRes.data.avatar_url;
    } else if (userName) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=025955&color=fff`;
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
            <Link className="text-mosque font-medium text-sm hover:border-b-2 hover:border-mosque px-1 py-1 transition-all" href="/buscar?type=Venta">{dict.navbar.buy}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="/buscar?type=Arriendo">{dict.navbar.rent}</Link>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector currentLanguage={currentLanguage} />
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2 relative group py-2">
                <button className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex items-center justify-center cursor-pointer">
                  {avatarUrl ? (
                    <img alt="Perfil" className="w-full h-full object-cover" src={avatarUrl} />
                  ) : (
                    <span className="material-icons text-gray-500">person</span>
                  )}
                </button>
                <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 min-w-[220px] z-50 translate-y-[-10px] group-hover:translate-y-0">
                  <div className="bg-white shadow-soft rounded-xl overflow-hidden border border-gray-100 p-1.5 flex flex-col">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
                      <p className="text-xs text-nordic-dark/50 font-medium uppercase tracking-wider mb-0.5">{dict.auth?.loggedInAs || "Conectado como"}</p>
                      <p className="text-sm text-nordic-dark font-medium truncate">
                        {userName || user.email}
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 capitalize">
                          {userRole}
                        </span>
                      </div>
                    </div>
                    {userRole === 'usuario' && (
                      <>
                        <Link href="/perfil" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                          <span className="material-icons text-[18px]">person</span>
                          Mi Perfil
                        </Link>
                      </>
                    )}
                    {userRole === 'vendedor' && (
                      <Link href="/vendedor" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                        <span className="material-icons text-[18px]">dashboard</span>
                        Panel Vendedor
                      </Link>
                    )}
                    {userRole === 'agente' && (
                      <Link href="/agente" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                        <span className="material-icons text-[18px]">support_agent</span>
                        CRM Agentes
                      </Link>
                    )}
                    {userRole === 'administrador' && (
                      <>
                        <Link href="/admin/properties" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                          <span className="material-icons text-[18px]">admin_panel_settings</span>
                          Panel Admin
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-3 pt-2 pb-1">Modo Dios (QA)</p>
                        <Link href="/vendedor" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                          <span className="material-icons text-[16px]">visibility</span>
                          Ver como Vendedor
                        </Link>
                        <Link href="/agente" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-nordic-dark hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                          <span className="material-icons text-[16px]">visibility</span>
                          Ver como Agente
                        </Link>
                      </>
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
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10" href="/buscar?type=Venta">{dict.navbar.buy}</Link>
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="/buscar?type=Arriendo">{dict.navbar.rent}</Link>
        </div>
      </div>
    </nav>
  );
}
