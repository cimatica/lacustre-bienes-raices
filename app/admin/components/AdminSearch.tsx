'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export default function AdminSearch({ placeholder = 'Buscar...' }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get('query') || '');

  // Sync state if URL changes
  useEffect(() => {
    setTerm(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('query', value);
      } else {
        params.delete('query');
      }
      params.delete('page'); // Reset pagination on new search
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative group w-full md:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className={`material-icons text-xl transition-colors ${isPending ? 'text-[#006655] animate-pulse' : 'text-[#19322F]/40 group-focus-within:text-[#006655]'}`}>
          search
        </span>
      </div>
      <input 
        value={term}
        onChange={handleSearch}
        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white text-[#19322F] shadow-sm placeholder-[#19322F]/30 focus:ring-2 focus:ring-[#006655] focus:bg-white transition-all text-sm" 
        placeholder={placeholder} 
        type="text" 
      />
    </div>
  );
}
