'use client';

/** Patron unique surtitre + titre + accroche, réutilisé par toutes les sections. */
const SectionHeading = ({
  eyebrow,
  title,
  lead,
  align = 'center',
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
  tone?: 'default' | 'inverted';
}) => {
  const inverted = tone === 'inverted';

  return (
    <div
      className={`mb-12 md:mb-14 ${
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'
      }`}
    >
      {eyebrow && (
        <p className={`eyebrow ${inverted ? 'text-white/60' : ''}`}>{eyebrow}</p>
      )}
      <h2 className={`h-section mt-3 ${inverted ? 'text-accent-foreground' : 'text-foreground'}`}>
        {title}
      </h2>
      {lead && (
        <p className={`lead mt-4 ${inverted ? 'text-accent-foreground/75' : ''}`}>{lead}</p>
      )}
    </div>
  );
};

export default SectionHeading;
