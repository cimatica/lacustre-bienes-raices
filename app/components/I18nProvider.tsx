'use client';

import { createContext, useContext, ReactNode } from 'react';

type Dictionary = any; // We can type this better later

const I18nContext = createContext<Dictionary | null>(null);

export function I18nProvider({ 
  children, 
  dictionary 
}: { 
  children: ReactNode; 
  dictionary: Dictionary 
}) {
  return (
    <I18nContext.Provider value={dictionary}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
