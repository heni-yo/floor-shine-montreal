'use client';

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { Lang } from '@/lib/site';

const Providers = ({ language, children }: { language: Lang; children: ReactNode }) => (
  <LanguageProvider language={language}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
    </TooltipProvider>
  </LanguageProvider>
);

export default Providers;
