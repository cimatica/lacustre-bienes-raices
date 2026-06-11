'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavbar() {
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
              <div className="w-8 h-8 rounded bg-[#006655] flex items-center justify-center text-white font-bold text-lg">L</div>
              <span className="font-bold text-xl tracking-tight text-[#19322F]">Lacustre Admin</span>
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
            <button className="p-2 rounded-full text-gray-400 hover:text-[#006655] hover:bg-[#006655]/5 transition-colors">
              <span className="material-icons text-xl">notifications_none</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#006655] transition-colors">
                Volver al sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
