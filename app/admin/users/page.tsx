import { createClient } from '@/utils/supabase/server';
import UserRoleSelect from './UserRoleSelect';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#19322F]">Gestión de Usuarios</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
            <tr>
              <th className="py-4 px-6 font-semibold">Email</th>
              <th className="py-4 px-6 font-semibold">Rol Actual</th>
              <th className="py-4 px-6 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{u.email}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    u.role === 'administrador' ? 'bg-purple-50 text-purple-700' :
                    u.role === 'agente' ? 'bg-blue-50 text-blue-700' :
                    u.role === 'vendedor' ? 'bg-orange-50 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <UserRoleSelect userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
