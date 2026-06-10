import { getDictionary } from '@/lib/i18n';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const dictionary = await getDictionary();
  const dict = dictionary.auth;

  return (
    <div className="font-display bg-[#EEF6F6] min-h-screen flex items-center justify-center p-4 antialiased text-[#19322F] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D9ECC8]/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#006655]/10 rounded-full blur-3xl"></div>
      </div>
      <main className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#006655] rounded-xl mb-6 shadow-[0_4px_20px_-2px_rgba(25,50,47,0.05)] text-white">
            <span className="material-symbols-outlined text-3xl">real_estate_agent</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#19322F] mb-2">{dict.welcome}</h1>
          <p className="text-[#19322F]/60">{dict.unlock}</p>
        </div>
        
        <LoginForm dict={dict} />
        
        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-[#19322F]/50">
            <a className="hover:text-[#19322F] transition-colors" href="#">{dict.privacy}</a>
            <a className="hover:text-[#19322F] transition-colors" href="#">{dict.terms}</a>
            <a className="hover:text-[#19322F] transition-colors" href="#">{dict.help}</a>
          </nav>
        </div>
      </main>
    </div>
  );
}
