'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
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
        className="flex items-center gap-1 text-sm font-medium text-nordic-dark/70 hover:text-mosque transition-colors py-2 px-3 rounded-md hover:bg-black/5"
      >
        <span className="material-symbols-outlined text-[20px]">language</span>
        <span className="hidden sm:inline-block">{activeLang.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-background-light rounded-md shadow-lg py-1 z-50 border border-nordic-dark/10 ring-1 ring-black ring-opacity-5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-mosque/10 text-mosque font-medium'
                  : 'text-nordic-dark hover:bg-black/5 hover:text-mosque'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
