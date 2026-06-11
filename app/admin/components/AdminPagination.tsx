'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export default function AdminPagination({ currentPage, totalPages, totalItems }: AdminPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalItems === 0) return null;

  return (
    <footer className="mt-8 border-t border-[#19322F]/5 py-6">
      <div className="flex items-center justify-between">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#19322F]/60">
              Mostrando <span className="font-medium text-[#19322F]">{(currentPage - 1) * 10 + 1}</span> a{' '}
              <span className="font-medium text-[#19322F]">{Math.min(currentPage * 10, totalItems)}</span> de{' '}
              <span className="font-medium text-[#19322F]">{totalItems}</span> resultados
            </p>
          </div>
          <div>
            <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-none -space-x-px">
              <button 
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium text-[#19322F]/50 hover:text-[#006655] transition-colors disabled:opacity-50"
              >
                <span className="sr-only">Anterior</span>
                <span className="material-icons text-xl">chevron_left</span>
              </button>

              {generatePagination(currentPage, totalPages).map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-[#19322F]/40">
                      ...
                    </span>
                  );
                }
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={
                      isActive
                        ? "z-10 bg-[#006655] text-white relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 shadow-sm"
                        : "bg-transparent text-[#19322F]/70 hover:bg-white hover:text-[#006655] relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors"
                    }
                  >
                    {page}
                  </button>
                );
              })}

              <button 
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium text-[#19322F]/50 hover:text-[#006655] transition-colors disabled:opacity-50"
              >
                <span className="sr-only">Siguiente</span>
                <span className="material-icons text-xl">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
        {/* Mobile view */}
        <div className="flex items-center justify-between w-full sm:hidden">
          <button 
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 text-sm font-medium rounded-md text-[#19322F] bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="ml-3 px-4 py-2 text-sm font-medium rounded-md text-[#19322F] bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </footer>
  );
}
