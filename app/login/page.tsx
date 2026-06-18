import { getDictionary } from '@/lib/i18n';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const dictionary = await getDictionary();
  const dict = dictionary.auth;

  return (
    <div className="font-display bg-surface-darkest min-h-screen flex items-center justify-center p-4 antialiased text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-mosque/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-mosque/10 rounded-full blur-3xl"></div>
      </div>
      <main className="w-full max-w-4xl z-10">
        <div className="text-center mb-12">
          <div className="mb-8 flex justify-center drop-shadow-lg hover:scale-105 transition-transform duration-500 ease-out">
            <img src="/img/logo.png" alt="Logo Lacustre" className="h-24 md:h-32 w-auto object-contain brightness-0 invert opacity-90" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 pb-1 whitespace-nowrap">
            {dict.welcome}
          </h1>
          <p className="text-slate-400 text-lg font-medium whitespace-nowrap">{dict.unlock}</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <LoginForm dict={dict} />
          
          <div className="mt-8 text-center">
            <nav className="flex justify-center gap-6 text-xs text-slate-500">
              <a className="hover:text-white transition-colors" href="#">{dict.privacy}</a>
              <a className="hover:text-white transition-colors" href="#">{dict.terms}</a>
              <a className="hover:text-white transition-colors" href="#">{dict.help}</a>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
