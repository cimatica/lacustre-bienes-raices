'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavbar({ user, userRole }: { user: any, userRole: string }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Propiedades', href: '/admin/properties' },
    { name: 'Usuarios', href: '/admin/users' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#006655]/10 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <img src="/img/logo_navbar.png" alt="Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold text-xl tracking-tight text-[#19322F]">Lacustre - Bienes Raíces Admin</span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-[#006655] text-[#19322F]'
                        : 'border-transparent text-gray-500 hover:text-[#006655] hover:border-[#006655]/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-[#006655] hover:bg-[#006655]/5 transition-colors relative">
              <span className="material-icons text-xl">notifications_none</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 group relative py-3">
              {user ? (
                <>
                  <div className="flex flex-col items-end hidden sm:flex cursor-pointer">
                    <span className="text-sm font-semibold text-[#19322F]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{userRole}</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white cursor-pointer flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <img alt="User profile" className="h-full w-full object-cover" src={user.user_metadata.avatar_url} />
                    ) : (
                      <span className="material-icons text-gray-500">person</span>
                    )}
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 min-w-[220px] z-50 translate-y-[-10px] group-hover:translate-y-0">
                    <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 p-1.5 flex flex-col">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Conectado como</p>
                        <p className="text-sm text-[#19322F] font-medium truncate">{user.email}</p>
                      </div>
                      <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#19322F] hover:bg-gray-50 rounded-lg w-full text-left transition-colors mb-1">
                        <span className="material-icons text-[18px]">web</span>
                        Volver al sitio
                      </Link>
                      <form action="/auth/signout" method="post" className="w-full">
                        <button type="submit" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors">
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Cerrar sesión
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#006655] transition-colors">
                  Volver al sitio
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
