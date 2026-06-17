import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '@/lib/supabase';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getDictionary } from '@/lib/i18n';
import { getUfValue } from '@/lib/currency';
import Link from 'next/link';
import ScheduleVisitClient from './ScheduleVisitClient';
import { createClient } from '@/utils/supabase/server';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const property = await getPropertyBySlug(decodedSlug);

  if (!property) {
    return { title: 'Propiedad no encontrada | Lacustre - Bienes Raíces' };
  }

  return {
    title: `Programar Visita - ${property.title} | Lacustre - Bienes Raíces`,
  };
}

export default async function ScheduleVisitPage({ params }: Props) {
  const resolvedParams = await params;
  const dict = await getDictionary();
  const ufValue = await getUfValue();
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const property = await getPropertyBySlug(decodedSlug);

  if (!property) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clpPrice = property.price * ufValue;

  return (
    <div className="bg-clearday dark:bg-[#0f2320] min-h-screen flex flex-col antialiased selection:bg-mosque/20 selection:text-mosque">
      <Navbar />

      <main className="flex-grow flex flex-col items-center py-8 px-4 md:px-8">
        <div className="w-full max-w-7xl mb-6">
          <Link href={`/propiedad/${property.slug}`} className="flex items-center gap-2 group text-nordic/60 hover:text-mosque transition-colors w-fit">
            <span className="material-icons text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-medium">{(dict as any).scheduleVisit?.back || "Back to property details"}</span>
          </Link>
        </div>

        <ScheduleVisitClient property={property} clpPrice={clpPrice} dict={dict} userId={user?.id} />
      </main>

      <Footer />
    </div>
  );
}
