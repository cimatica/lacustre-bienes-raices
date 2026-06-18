"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      aria-label="Paginación de propiedades"
      className="flex items-center justify-center gap-1 mt-12"
    >
      {/* Previous */}
      <Link
        href={isFirst ? "#" : buildHref(currentPage - 1)}
        aria-disabled={isFirst}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all text-sm font-medium
          ${
            isFirst
              ? "border-slate-700/50 text-slate-600 pointer-events-none"
              : "border-slate-700/50 text-slate-300 hover:border-mosque hover:text-mosque hover:bg-surface-darker hover:shadow-md"
          }`}
      >
        <span className="material-icons text-lg">chevron_left</span>
      </Link>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-10 h-10 flex items-center justify-center text-slate-500 text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-medium transition-all
              ${
                p === currentPage
                  ? "border-mosque bg-mosque text-white shadow-md"
                  : "border-slate-700/50 text-slate-300 hover:border-mosque hover:text-mosque hover:bg-surface-darker hover:shadow-md"
              }`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={isLast ? "#" : buildHref(currentPage + 1)}
        aria-disabled={isLast}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all text-sm font-medium
          ${
            isLast
              ? "border-slate-700/50 text-slate-600 pointer-events-none"
              : "border-slate-700/50 text-slate-300 hover:border-mosque hover:text-mosque hover:bg-surface-darker hover:shadow-md"
          }`}
      >
        <span className="material-icons text-lg">chevron_right</span>
      </Link>
    </nav>
  );
}
