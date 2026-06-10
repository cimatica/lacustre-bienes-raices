import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#19322F]">Panel Admin</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#006655] transition-colors"
            >
              <span className="material-icons text-[20px]">home</span>
              Propiedades
            </Link>
            <Link 
              href="/admin/users" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#006655] transition-colors"
            >
              <span className="material-icons text-[20px]">people</span>
              Usuarios
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
