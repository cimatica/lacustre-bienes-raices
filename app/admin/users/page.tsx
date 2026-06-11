import { createClient } from '@/utils/supabase/server';
import UserRoleSelect from './UserRoleSelect';
import AdminSearch from '../components/AdminSearch';
import AdminPagination from '../components/AdminPagination';
import AddUserModal from './AddUserModal';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  
  const query = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query : '';
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const itemsPerPage = 10;
  
  let userQuery = supabase
    .from('user_roles')
    .select('*', { count: 'exact' });
    
  if (query) {
    userQuery = userQuery.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
  }
  
  const { data: users, error, count } = await userQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12 space-y-4">
      <header className="w-full pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#19322F]">Directorio de Usuarios</h1>
            <p className="text-[#19322F]/60 mt-1 text-sm">Gestiona el acceso y roles de los usuarios de tu plataforma.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <AdminSearch placeholder="Buscar por email o nombre..." />
            <AddUserModal />
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-[#19322F]/10 overflow-x-auto">
          <button className="pb-3 text-sm font-semibold text-[#006655] border-b-2 border-[#006655]">Todos</button>
          <button className="pb-3 text-sm font-medium text-[#19322F]/60 hover:text-[#19322F] transition-colors">Agentes</button>
          <button className="pb-3 text-sm font-medium text-[#19322F]/60 hover:text-[#19322F] transition-colors">Vendedores</button>
          <button className="pb-3 text-sm font-medium text-[#19322F]/60 hover:text-[#19322F] transition-colors">Admins</button>
        </div>
      </header>

      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#19322F]/50 mb-2">
        <div className="col-span-4">Detalles del Usuario</div>
        <div className="col-span-3">Rol & Estado</div>
        <div className="col-span-3">Rendimiento</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {users?.map((u: any, index: number) => {
        const shortId = u.id.split('-')[0].toUpperCase();
        const displayName = u.full_name || u.email.split('@')[0];
        
        return (
          <div key={u.id} style={{ zIndex: 50 - index }} className="user-card group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:bg-[#D9ECC8]/30 transition-colors flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-4 flex items-center w-full">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                  <span className="material-icons text-gray-500">person</span>
                </div>
                <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${u.status === 'Active' || !u.status ? 'bg-green-400' : 'bg-gray-400'}`}></span>
              </div>
              <div className="ml-4 overflow-hidden">
                <div className="text-sm font-bold text-[#19322F] truncate">{displayName}</div>
                <div className="text-xs text-[#19322F]/60 truncate">{u.email}</div>
                <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-gray-50 rounded text-[#19322F]/50 group-hover:bg-white/50 transition-colors">ID: #USR-{shortId}</div>
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                u.role === 'administrador' ? 'bg-[#19322F] text-white' :
                u.role === 'agente' ? 'bg-[#006655]/10 text-[#006655]' :
                u.role === 'vendedor' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {u.role}
              </span>
              <div className="flex items-center text-xs text-[#19322F]/60">
                <span className={`material-icons text-[14px] mr-1 ${u.status === 'Active' || !u.status ? 'text-[#006655]' : 'text-gray-400'}`}>
                  {u.status === 'Active' || !u.status ? 'check_circle' : 'schedule'}
                </span>
                {u.status || 'Activo'}
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#19322F]/40">Propiedades</div>
                <div className="text-sm font-semibold text-[#19322F]">{u.properties_count || 0}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#19322F]/40">Ventas (YTD)</div>
                <div className="text-sm font-semibold text-[#19322F]">${(u.sales_ytd || 0).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
              <UserRoleSelect userId={u.id} currentRole={u.role} />
            </div>
          </div>
        );
      })}
      
      {(!users || users.length === 0) && (
        <div className="py-12 text-center text-gray-500 bg-white rounded-xl">
          {query ? 'No se encontraron usuarios para tu búsqueda.' : 'No hay usuarios registrados aún.'}
        </div>
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} totalItems={count || 0} />
    </main>
  );
}
