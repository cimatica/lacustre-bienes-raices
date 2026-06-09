import Link from 'next/link';
import Image from 'next/image';
import { getDictionary, getCurrentLanguage } from '@/lib/i18n';
import LanguageSelector from '@/app/components/LanguageSelector';

export default async function Navbar() {
  const dict = await getDictionary();
  const currentLanguage = await getCurrentLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-clear-day border-b border-mosque/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="material-symbols-outlined text-mosque text-3xl font-bold">villa</span>
            <span className="font-bold text-xl tracking-tight text-nordic">LuxeEstate</span>
          </Link>
          <div className="hidden md:flex items-center space-x-10">
            <Link className="relative text-sm font-semibold text-nordic hover:text-mosque transition-colors py-2" href="#">
              {dict.navbar.buy}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-mosque"></span>
            </Link>
            <Link className="text-sm font-semibold text-nordic/70 hover:text-mosque transition-colors py-2" href="#">{dict.navbar.rent}</Link>
            <Link className="text-sm font-semibold text-nordic/70 hover:text-mosque transition-colors py-2" href="#">{dict.navbar.sell}</Link>
            <Link className="text-sm font-semibold text-nordic/70 hover:text-mosque transition-colors py-2" href="#">{dict.navbar.saved}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector currentLanguage={currentLanguage} />
            <button className="p-2 text-nordic hover:text-mosque transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="p-2 text-nordic hover:text-mosque transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full"></span>
            </button>
            <button className="ml-2 flex items-center gap-2 p-1 rounded-full hover:bg-mosque/5 transition-colors">
              <div className="w-9 h-9 rounded-full bg-mosque/10 overflow-hidden border border-mosque/20 relative">
                <Image alt="User Profile" fill unoptimized className="object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhLuM9qNltZNxgIWPtC3dVxQ_JLFKXYB9d_klGFux_2JVOGtRlbV4GvpvdT4wqpsueZnXFQhKJe9MGGvM6rXQX15iv80mbEKxjmy4X14AZRqvp573ZlKYDN9bAb0ka7B-g5mkOCP6nRuKC9QsO02JVq6gqZeAo3-7dUurVhhgPJGeuL0Gk2Cp3Wnu5mVlUtpajB2wtx8uMoytbh78i9RmHYtJg52ZELl9XdIC9f5Kix_lFMFoi6Ru61ARrEGIrvgvz4ViiKhufTns" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
