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
  let initialProfile: any = null;
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_types(name)')
      .eq('id', user.id)
      .maybeSingle();
    if (roleData && roleData.role_types) {
      const roleTypes: any = roleData.role_types;
      userRole = Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name;
    }
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    if (profile) initialProfile = profile;
  }

  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] font-sans flex flex-col antialiased">
      <AdminNavbar user={user} userRole={userRole} initialProfile={initialProfile} />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
