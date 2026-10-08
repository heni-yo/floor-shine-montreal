'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import { buildFaqSchema } from '@/lib/site';

/**
 * FAQ réduite aux questions pertinentes pour le service, avec un balisage
 * FAQPage limité à ce qui est réellement affiché sur la page.
 */
const ServiceFaqSection = ({ faqKeys }: { faqKeys: string[] }) => {
  const { t } = useLanguage();

  const qa = faqKeys.map((key) => ({
    question: t(`faq.q${key}`),
    answer: t(`faq.a${key}`),
  }));

  return (
    <>
      <JsonLd data={buildFaqSchema(qa)} />
      <FAQ keys={faqKeys} heading={t('service.faq.title')} compact />
    </>
  );
};

export default ServiceFaqSection;
