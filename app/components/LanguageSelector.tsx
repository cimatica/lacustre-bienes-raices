'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'es', label: 'Español', flagUrl: 'https://flagcdn.com/w20/cl.png' },
  { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w20/us.png' },
  { code: 'pt', label: 'Português', flagUrl: 'https://flagcdn.com/w20/br.png' },
  { code: 'fr', label: 'Français', flagUrl: 'https://flagcdn.com/w20/fr.png' },
];

export default function LanguageSelector({ currentLanguage }: { currentLanguage: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = languages.find(l => l.code === currentLanguage) || languages[0];

  const changeLanguage = (langCode: string) => {
    document.cookie = `USER_LANGUAGE=${langCode}; path=/; max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-nordic-dark/70 hover:text-mosque transition-colors py-2 px-3 rounded-md hover:bg-black/5"
      >
        <div className="relative w-5 h-[15px] overflow-hidden rounded-sm shadow-sm border border-black/10">
          <Image src={activeLang.flagUrl} alt={activeLang.label} fill unoptimized className="object-cover" />
        </div>
        <span className="hidden sm:inline-block">{activeLang.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-background-light rounded-md shadow-lg py-1 z-50 border border-nordic-dark/10 ring-1 ring-black ring-opacity-5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-mosque/10 text-mosque font-medium'
                  : 'text-nordic-dark hover:bg-black/5 hover:text-mosque'
              }`}
            >
              <div className="relative w-5 h-[15px] overflow-hidden rounded-sm shadow-sm border border-black/10">
                <Image src={lang.flagUrl} alt={lang.label} fill unoptimized className="object-cover" />
              </div>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
