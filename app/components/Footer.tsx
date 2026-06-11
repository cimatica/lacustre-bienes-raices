import { getDictionary } from '@/lib/i18n';

export default async function Footer() {
  const dict = await getDictionary();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-light border-t border-nordic-dark/5 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img 
            src="/img/logo.png" 
            alt="Logo Lacustre" 
            className="h-24 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
          />
          <span className="text-sm font-medium text-nordic-dark/50">
            © {currentYear} Reservados todos los derechos
          </span>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm font-medium text-nordic-dark/50">
          <a className="hover:text-mosque transition-colors" href="#">Política de Privacidad</a>
          <a className="hover:text-mosque transition-colors" href="#">Términos de Servicio</a>
          <a className="hover:text-mosque transition-colors" href="#">Centro de Ayuda</a>
        </div>
      </div>
    </footer>
  );
}
