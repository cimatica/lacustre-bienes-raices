"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown({ dict }: { dict: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "price_asc";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "price_asc") {
      params.delete("sort"); // Ascending is default
    } else {
      params.set("sort", value);
    }

    // Scroll false ensures the page doesn't reload and jump to top, doing a soft navigation
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-nordic-muted">
        {dict.search?.sortBy || "Ordenar por:"}
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleChange}
          className="appearance-none bg-white border border-nordic-dark/10 rounded-lg py-2 pl-3 pr-8 text-sm text-nordic-dark font-medium focus:outline-none focus:ring-2 focus:ring-mosque/50 cursor-pointer hover:border-mosque/50 transition-colors"
        >
          <option value="price_asc">{dict.search?.priceAsc || "Precio: Menor a Mayor"}</option>
          <option value="price_desc">{dict.search?.priceDesc || "Precio: Mayor a Menor"}</option>
        </select>
        <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-nordic-muted pointer-events-none text-[18px]">
          expand_more
        </span>
      </div>
    </div>
  );
}
