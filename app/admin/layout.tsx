import AdminNavbar from './AdminNavbar';
import { createClient } from '@/utils/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] font-sans flex flex-col antialiased">
      <AdminNavbar user={user} userRole={userRole} />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
