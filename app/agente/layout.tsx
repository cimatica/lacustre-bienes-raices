import { redirect } from 'next/navigation';
import AgenteNavbar from './AgenteNavbar';
import { createClient } from '@/utils/supabase/server';

export default async function AgenteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  let userRole = 'usuario';
  let userProfile = null;
  
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_types(name)')
      .eq('id', user.id)
      .maybeSingle();
      
    if (roleData && roleData.role_types) {
      userRole = roleData.role_types.name;
    }
    
    if (userRole !== 'agente' && userRole !== 'administrador') {
      redirect('/');
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    userProfile = profile;
  }

  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] font-sans flex flex-col antialiased">
      <AgenteNavbar user={user} userRole={userRole} initialProfile={userProfile} />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
