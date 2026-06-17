import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <img src="/img/logo.png" alt="Logo" className="h-24 w-auto object-contain" />
        </div>
        <h1 className="text-7xl font-black text-[#19322F] mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-[#19322F] mb-3">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Lo sentimos, la página que estás buscando no existe, ha sido eliminada o tal vez escribiste mal la dirección.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
          <Link
            href="/"
            className="flex-1 py-3 bg-[#006655] text-white rounded-lg font-medium hover:bg-[#004d40] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-icons text-[18px]">home</span>
            Volver al Inicio
          </Link>
          <Link
            href="/buscar"
            className="flex-1 py-3 bg-gray-50 text-[#19322F] border border-gray-200 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-icons text-[18px]">search</span>
            Explorar
          </Link>
        </div>
      </div>
    </div>
  );
}
