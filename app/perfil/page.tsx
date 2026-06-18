import { getDictionary } from '@/lib/i18n';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile, getUserFavorites, getUserVisits } from '@/lib/supabase';
import { formatUF } from '@/lib/currency';
import Link from 'next/link';

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
      .select('role')
      .eq('id', user.id)
      .single();
    if (roleData) {
      userRole = roleData.role;
    }
  }

  // Fetch real data
  const profile = userId ? await getUserProfile(userId) : null;
  const favorites = userId ? await getUserFavorites(userId) : [];
  const visits = userId ? await getUserVisits(userId) : [];
  
  const isSeller = userRole === 'vendedor';
  const propertiesCount = isSeller ? favorites.length : favorites.length; // In a real app we'd fetch host properties if seller
  const visitsCount = visits.length;
  
  const statsSavedLabel = isSeller ? (dict as any).seller?.activeListings || "Active Listings" : (dict as any).userProfile?.saved || "Saved";
  const statsVisitsLabel = isSeller ? (dict as any).seller?.receivedVisits || "Received Visits" : (dict as any).userProfile?.visits || "Visits";
  const statsSoldLabel = isSeller ? (dict as any).seller?.soldProperties || "Sold Properties" : (dict as any).userProfile?.sold || "Sold";
  const tab1Label = isSeller ? (dict as any).seller?.myProperties || "My Properties" : (dict as any).userProfile?.savedProperties || "Saved Properties";
  const tab2Label = isSeller ? (dict as any).seller?.receivedVisits || "Received Visits" : (dict as any).userProfile?.scheduledVisits || "Scheduled Visits";
  const sectionVisitsLabel = isSeller ? (dict as any).seller?.receivedVisits || "Received Visits" : (dict as any).userProfile?.upcomingVisits || "Upcoming Visits";

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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd_ouiePtERQTSfbcLEHNMJhNFxSXP8beK-4DetlBD_G0XENGPBbXjEfk08cNoUsGBoIWZRMRRoQTdL6tgGLyjrYglYUnUw7ce2O3Y6cHRIWZBN2BXU6YPG0jHhit2hPdam7opmhwpFjsGY68pDpCqMVQ6yj3wPulKs2X3PG2UcHOfoCZgt12BZpZ_XHj9-xT3VJHunaR-f6j8HYVS8FrTtKh_io3Iu2E7JIucJmHGGc4J0AF5MISFaObH51sFDruLCdwyyBAC3Cs"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 lg:w-10 lg:h-10 bg-mosque text-white rounded-full flex items-center justify-center hover:bg-nordic transition-colors shadow-md">
                <span className="material-icons text-sm lg:text-base">edit</span>
              </button>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Elena Richardson</h1>
              <p className="text-slate-400 font-light flex items-center gap-2">
                <span className="material-icons text-sm">location_on</span> San Francisco, CA
                <span className="mx-2">•</span>
                {(dict as any).userProfile?.memberSince || "Member since"} 2021
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
              <div className="text-2xl font-bold text-mosque">{visitsCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{statsVisitsLabel}</div>
            </div>
            <div className="w-px bg-slate-700/50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{statsSoldLabel}</div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-700/50 mb-10 overflow-x-auto">
          <button className="pb-4 px-2 text-white font-semibold border-b-2 border-mosque transition-colors whitespace-nowrap">
            {tab1Label}
          </button>
          <button className="pb-4 px-2 text-slate-400 hover:text-white font-medium border-b-2 border-transparent hover:border-slate-600 transition-colors whitespace-nowrap">
            {tab2Label}
          </button>
          <button className="pb-4 px-2 text-slate-400 hover:text-white font-medium border-b-2 border-transparent hover:border-slate-600 transition-colors whitespace-nowrap">
            {(dict as any).userProfile?.preferences || "Preferences & Settings"}
          </button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.length === 0 ? (
             <div className="col-span-full py-8 text-center text-slate-400">
               No properties found.
             </div>
          ) : favorites.map(fav => {
            const property = fav.property;
            if (!property) return null;
            return (
              <div key={fav.id} className="group bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50">
                <Link href={`/propiedad/${property.slug}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={property.images?.[0] || 'https://via.placeholder.com/400'} />
                    <div className="absolute top-4 right-4 z-10">
                      <button className="w-10 h-10 bg-surface-darkest/90 backdrop-blur-md rounded-full flex items-center justify-center text-mosque shadow-sm transition-colors">
                        <span className="material-icons">favorite</span>
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-surface-darkest/90 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-medium z-10">
                      {formatUF(property.price)}
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-1">{property.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-sm border-t border-slate-700/50 pt-4">
                    <div className="flex items-center gap-1.5"><span className="material-icons text-base">bed</span> {property.beds}</div>
                    <div className="flex items-center gap-1.5"><span className="material-icons text-base">bathtub</span> {property.baths}</div>
                    <div className="flex items-center gap-1.5"><span className="material-icons text-base">square_foot</span> {property.area}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Visits */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-mosque rounded-full"></span>
            {sectionVisitsLabel}
          </h2>
          <div className="space-y-4">
            {visits.length === 0 ? (
              <div className="text-slate-400">No upcoming visits.</div>
            ) : visits.map((v, i) => {
              const prop = v.property;
              if (!prop) return null;
              const dateObj = new Date(v.visit_date);
              
              return (
                <div key={v.id} className="flex flex-col md:flex-row bg-surface-darker p-2 rounded-xl border border-slate-700/50 items-center hover:bg-surface-dark transition-colors shadow-sm">
                  <div className="w-full md:w-48 h-32 md:h-24 rounded-lg overflow-hidden shrink-0 relative">
                    <img alt="Thumbnail" className="w-full h-full object-cover" src={prop.images?.[0] || 'https://via.placeholder.com/200'} />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-mosque font-semibold text-sm mb-1 uppercase tracking-wide">
                        <span className="material-icons text-base">calendar_today</span> {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <h4 className="text-lg font-bold text-white">{prop.title}</h4>
                      <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                        <span className="material-icons text-sm">location_on</span> {prop.location}
                      </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg border border-slate-700/50 text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium">
                        {(dict as any).userProfile?.reschedule || "Reschedule"}
                      </button>
                      <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-mosque text-white hover:bg-nordic transition-colors text-sm font-medium shadow-sm shadow-mosque/30">
                        {(dict as any).userProfile?.getDirections || "Get Directions"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Account Preferences */}
        <section className="mt-16 bg-surface-darker rounded-2xl p-8 border border-slate-700/50 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">{(dict as any).userProfile?.accountPreferences || "Account Preferences"}</h2>
              <p className="text-slate-400 text-sm mt-1">{(dict as any).userProfile?.accountPreferencesDesc || "Manage your account settings"}</p>
            </div>
            <button className="text-mosque font-medium text-sm hover:underline">{(dict as any).userProfile?.viewAllSettings || "View all settings"}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{(dict as any).userProfile?.emailAddress || "Email Address"}</label>
              <div className="flex items-center gap-3 p-3 bg-surface-darkest rounded-lg border border-slate-700/50">
                <span className="material-icons text-slate-500">mail</span>
                <input className="bg-transparent border-none outline-none flex-1 text-slate-200 text-sm focus:ring-0 w-full" readOnly type="email" value={email} />
                <button className="text-xs text-mosque font-medium">{(dict as any).userProfile?.change || "Change"}</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{(dict as any).userProfile?.notifications || "Notifications"}</label>
              <div className="flex items-center justify-between p-3 bg-surface-darkest rounded-lg border border-slate-700/50 h-[50px]">
                <span className="text-sm text-slate-200">{(dict as any).userProfile?.propertyAlerts || "New Property Alerts"}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                  <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mosque"></div>
                </label>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
