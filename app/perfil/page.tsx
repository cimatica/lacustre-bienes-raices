import { getDictionary } from '@/lib/i18n';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile, getUserFavorites, getUserVisits } from '@/lib/supabase';
import { formatUF } from '@/lib/currency';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ProfileTabs from './components/ProfileTabs';

export const metadata = {
  title: 'Perfil de Usuario | Lacustre - Bienes Raíces',
};

export default async function UserProfilePage() {
  const dict = await getDictionary();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = 'usuario';
  let userId = '';
  let email = '';
  
  if (user) {
    userId = user.id;
    email = user.email || '';
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_types(name)')
      .eq('id', user.id)
      .maybeSingle();
    if (roleData && roleData.role_types) {
      const roleTypes: any = roleData.role_types;
      userRole = Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name;
    }
  }

  if (!user) {
    redirect('/login');
  }

  if (userRole === 'administrador') {
    redirect('/admin/properties');
  } else if (userRole === 'vendedor') {
    redirect('/vendedor');
  } else if (userRole === 'agente') {
    redirect('/agente');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Fetch real data
  const profile = userId ? await getUserProfile(userId) : null;
  const favorites = userId ? await getUserFavorites(userId, token) : [];
  const visits = userId ? await getUserVisits(userId, token) : [];
  
  const propertiesCount = favorites.length;
  const scheduledVisitsCount = visits.filter((v: any) => v.status === 'scheduled').length;
  const completedVisitsCount = visits.filter((v: any) => v.status === 'completed').length;
  
  const statsSavedLabel = (dict as any).userProfile?.saved || "Propiedades Guardadas";
  const statsVisitsLabel = (dict as any).userProfile?.visits || "Visitas Agendadas";
  const statsSoldLabel = "Completadas";
  const tab1Label = (dict as any).userProfile?.savedProperties || "Propiedades Guardadas";
  const tab2Label = (dict as any).userProfile?.scheduledVisits || "Visitas Programadas";
  const sectionVisitsLabel = (dict as any).userProfile?.upcomingVisits || "Próximas Visitas";

  return (
    <div className="font-display min-h-screen flex flex-col selection:bg-mosque selection:text-white">
      <Navbar />

      <main className="flex-1 p-4 sm:p-8 lg:p-12 xl:p-16 max-w-7xl mx-auto w-full">
        {/* Header Profile */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-700/50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img 
                alt="Profile portrait" 
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-slate-800 shadow-lg" 
                src={profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAd_ouiePtERQTSfbcLEHNMJhNFxSXP8beK-4DetlBD_G0XENGPBbXjEfk08cNoUsGBoIWZRMRRoQTdL6tgGLyjrYglYUnUw7ce2O3Y6cHRIWZBN2BXU6YPG0jHhit2hPdam7opmhwpFjsGY68pDpCqMVQ6yj3wPulKs2X3PG2UcHOfoCZgt12BZpZ_XHj9-xT3VJHunaR-f6j8HYVS8FrTtKh_io3Iu2E7JIucJmHGGc4J0AF5MISFaObH51sFDruLCdwyyBAC3Cs"}
              />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">{profile?.full_name || 'Usuario'}</h1>
              <p className="text-slate-400 font-light flex items-center gap-2">
                <span className="material-icons text-sm">location_on</span> {profile?.location || 'Sin ubicación'}
                <span className="mx-2">•</span>
                {(dict as any).userProfile?.memberSince || "Miembro desde"} 2024
              </p>
            </div>
          </div>
          <div className="flex gap-6 lg:gap-12 bg-surface-darker px-8 py-4 rounded-xl shadow-sm border border-slate-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{propertiesCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{statsSavedLabel}</div>
            </div>
            <div className="w-px bg-slate-700/50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-mosque">{scheduledVisitsCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{statsVisitsLabel}</div>
            </div>
            <div className="w-px bg-slate-700/50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{completedVisitsCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{statsSoldLabel}</div>
            </div>
          </div>
        </header>

        {/* Interactive Tabs Content */}
        <ProfileTabs 
          favorites={favorites} 
          visits={visits} 
          profile={profile} 
          email={email} 
          dict={dict} 
        />
      </main>

      <Footer />
    </div>
  );
}
