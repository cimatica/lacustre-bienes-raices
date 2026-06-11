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
      <main className="w-full max-w-4xl z-10">
        <div className="text-center mb-12">
          <div className="mb-8 flex justify-center drop-shadow-lg hover:scale-105 transition-transform duration-500 ease-out">
            <img src="/img/logo.png" alt="Logo Lacustre" className="h-24 md:h-32 w-auto object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#006655] to-[#19322F] mb-3 pb-1 whitespace-nowrap">
            {dict.welcome}
          </h1>
          <p className="text-[#19322F]/70 text-lg font-medium whitespace-nowrap">{dict.unlock}</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <LoginForm dict={dict} />
          
          <div className="mt-8 text-center">
            <nav className="flex justify-center gap-6 text-xs text-[#19322F]/50">
              <a className="hover:text-[#19322F] transition-colors" href="#">{dict.privacy}</a>
              <a className="hover:text-[#19322F] transition-colors" href="#">{dict.terms}</a>
              <a className="hover:text-[#19322F] transition-colors" href="#">{dict.help}</a>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
