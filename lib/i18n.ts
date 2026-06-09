import { cookies } from 'next/headers';

const defaultLocale = 'es';

const dictionaries = {
  es: () => import('../dictionaries/es.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  pt: () => import('../dictionaries/pt.json').then((module) => module.default),
  fr: () => import('../dictionaries/fr.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('USER_LANGUAGE')?.value || defaultLocale;
  
  if (locale in dictionaries) {
    return dictionaries[locale as Locale]();
  }
  return dictionaries[defaultLocale as Locale]();
};

export const getCurrentLanguage = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('USER_LANGUAGE')?.value || defaultLocale;
};
