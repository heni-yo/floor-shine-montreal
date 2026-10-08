'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { translations, type Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/** La langue est déterminée par la route (FR à la racine, EN sous /en). */
export const LanguageProvider = ({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) => {
  const t = (key: string): string => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

