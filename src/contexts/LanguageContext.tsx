import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.services': 'Services',
    'nav.why': 'Pourquoi nous',
    'nav.process': 'Processus',
    'nav.gallery': 'Galerie',
    'nav.testimonials': 'Témoignages',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.quote': 'Soumission gratuite',

    // Hero
    'hero.title': 'Sablage de Plancher à Montréal',
    'hero.subtitle': 'Montréal · Rive-Sud · Rive-Nord',
    'hero.description': 'Redonnez vie à vos planchers de bois franc avec notre service professionnel de sablage de plancher à Montréal. Qualité supérieure, résultats impeccables, soumission gratuite.',
    'hero.cta.quote': 'Demander une soumission',
    'hero.cta.call': 'Appelez-nous',

    // Form
    'form.title': 'Soumission Gratuite',
    'form.subtitle': 'Obtenez votre estimation sans engagement',
    'form.firstName': 'Prénom',
    'form.lastName': 'Nom',
    'form.phone': 'Téléphone',
    'form.email': 'Courriel',
    'form.address': 'Adresse complète du projet',
    'form.postalCode': 'Code Postal',
    'form.city': 'Ville',
    'form.servicesTitle': 'Choisissez le(s) service(s) désiré(s)',
    'form.service.floor': 'Sablage de plancher',
    'form.service.stairs': 'Sablage d\'escalier',
    'form.service.repair': 'Réparation de plancher',
    'form.date': 'Date des travaux désirés',
    'form.details': 'Veuillez écrire le plus de détails possible',
    'form.area': 'Superficie approximative du projet (pi²)',
    'form.areaHelper': 'Largeur × Longueur (en pieds) = total en pieds carrés',
    'form.areaExample': 'Ex : 20 × 25 = 500 pi²',
    'form.wantColor': 'Désirez-vous mettre une couleur sur votre plancher?',
    'form.floorType.label': 'Type de plancher',
    'form.floorType.prefinished': 'Plancher préverni (jamais sablé, traité en usine)',
    'form.floorType.regular': 'Plancher régulier (chêne, érable, merisier, parqueterie, etc.)',
    'form.floorType.note': 'Plancher préverni = plancher jamais sablé et déjà traité en usine.',
    'form.stair.detailsLabel': 'Détails de l\'escalier',
    'form.stair.marches': 'Nombre de marches',
    'form.stair.barreaux': 'Nombre de barreaux',
    'form.stair.contremarches': 'Nombre de contremarches',
    'form.stair.poteaux': 'Nombre de poteaux',
    'form.stair.limon': 'Nombre de pieds linéaires (pl) limon',
    'form.stair.fauxLimon': 'Nombre de pieds linéaires (pl) faux limon',
    'form.stair.mainCourante': 'Nombre de pieds carrés main courante',
    'form.colorYes': 'Oui',
    'form.colorNo': 'Non',
    'form.photos': 'Veuillez inclure les photos de votre plancher afin que l\'on puisse vous offrir une estimation rapide et précise',
    'form.photosMax': '10 max',
    'form.specialNeeds': 'Veuillez décrire vos besoins particuliers s\'il y a lieu',
    'form.submit': 'Envoyer',
    'form.submitting': 'Envoi en cours…',
    'form.uploadNote': 'Il se peut vu la grosseur des photos que le chargement prend quelques secondes de plus.',
    'form.success': 'Merci! Votre demande a été envoyée avec succès. Nous vous contacterons sous peu.',
    'form.errorNetwork': 'Impossible de joindre le serveur. Vérifiez votre connexion ou réessayez plus tard.',
    'form.errorServer': 'Une erreur est survenue à l’envoi. Veuillez réessayer ou nous appeler.',
    'form.required': 'Ce champ est requis',
    'form.invalidEmail': 'Courriel invalide',
    'form.invalidPhone': 'Numéro de téléphone invalide',
    'form.invalidPostalCode': 'Code postal invalide',
    'form.selectService': 'Veuillez sélectionner au moins un service',

    // Services
    'services.title': 'Services de Sablage de Plancher à Montréal',
    'services.subtitle': 'Des solutions professionnelles de sablage, finition et réparation de planchers de bois franc',
    'services.floor.title': 'Sablage de Plancher',
    'services.floor.description': 'Restaurez la beauté naturelle de vos planchers de bois franc à Montréal. Notre équipe utilise des techniques professionnelles de sablage pour un fini impeccable dans votre maison.',
    'services.floor.benefits': 'Enlèvement des rayures et imperfections • Application de teinture sur mesure • Finition durable et résistante',
    'services.stairs.title': 'Sablage d\'Escalier',
    'services.stairs.description': 'Transformez vos escaliers en bois avec un sablage professionnel à Montréal. Chaque marche reçoit une attention particulière pour un résultat harmonieux.',
    'services.stairs.benefits': 'Travail minutieux sur chaque marche • Harmonisation avec vos planchers • Finition antidérapante disponible',
    'services.repair.title': 'Réparation de Planchers',
    'services.repair.description': 'Service de réparation de planchers de bois à Montréal. Remplacement de lattes abîmées, correction des imperfections avant le sablage.',
    'services.repair.benefits': 'Remplacement de lattes endommagées • Correction des planches gondolées • Réparation des joints et fissures',
    'services.cta': 'Demander une soumission',

    // Why Us
    'why.title': 'Pourquoi Choisir TALON PLANCHER à Montréal',
    'why.subtitle': 'L\'excellence au service de vos planchers de bois franc',
    'why.quality.title': 'Qualité Supérieure',
    'why.quality.description': 'Nous utilisons des équipements professionnels de sablage et des produits de haute qualité pour des résultats durables sur vos planchers.',
    'why.detail.title': 'Souci du Détail',
    'why.detail.description': 'Chaque projet de sablage de plancher reçoit une attention minutieuse, des coins aux bordures, pour un fini parfait.',
    'why.timing.title': 'Respect des Délais',
    'why.timing.description': 'Nous respectons les échéanciers convenus pour votre projet de sablage à Montréal et vous tenons informés à chaque étape.',
    'why.transparency.title': 'Soumission Transparente',
    'why.transparency.description': 'Prix clairs, sans surprise. Vous savez exactement ce que vous payez pour votre sablage de plancher.',
    'why.satisfaction.title': 'Satisfaction Garantie',
    'why.satisfaction.description': 'Votre satisfaction est notre priorité. Nous ne partons pas tant que vous n\'êtes pas satisfait du résultat.',
    'why.experience.title': 'Expérience à Montréal',
    'why.experience.description': 'Des années d\'expertise en sablage de planchers à Montréal, Rive-Sud et Rive-Nord.',

    // Process
    'process.title': 'Notre Processus',
    'process.subtitle': 'Un travail méthodique pour des résultats impeccables',
    'process.step1.title': 'Évaluation',
    'process.step1.description': 'Visite gratuite pour évaluer l\'état de vos planchers et établir un plan de travail personnalisé.',
    'process.step2.title': 'Préparation',
    'process.step2.description': 'Protection des murs, meubles et préparation de la surface pour le sablage.',
    'process.step3.title': 'Sablage',
    'process.step3.description': 'Sablage professionnel en plusieurs passages pour une surface parfaitement lisse.',
    'process.step4.title': 'Finition',
    'process.step4.description': 'Application de teinture (si désirée) et de vernis protecteur de haute qualité.',
    'process.step5.title': 'Inspection',
    'process.step5.description': 'Vérification finale avec vous pour s\'assurer de votre entière satisfaction.',

    // Gallery
    'gallery.title': 'Nos Réalisations en Sablage de Plancher',
    'gallery.subtitle': 'Découvrez nos projets de sablage de plancher à Montréal',
    'gallery.before': 'Avant',
    'gallery.after': 'Après',

    // Testimonials
    'testimonials.title': 'Témoignages',
    'testimonials.subtitle': 'Ce que nos clients disent',

    // Areas
    'areas.title': 'Zones Desservies à Montréal',
    'areas.subtitle': 'Sablage de plancher à Montréal et ses environs',
    'areas.description': 'Notre équipe de sablage de plancher se déplace à Montréal, sur la Rive-Sud et la Rive-Nord pour vous offrir un service professionnel.',

    // FAQ
    'faq.title': 'Questions Fréquentes sur le Sablage de Plancher',
    'faq.subtitle': 'Tout ce que vous devez savoir sur le sablage de plancher à Montréal',
    'faq.q1': 'Combien de temps dure le sablage d\'un plancher?',
    'faq.a1': 'En général, le sablage d\'un plancher prend de 2 à 4 jours selon la superficie et l\'état du plancher. Cela inclut le temps de séchage entre les couches de vernis.',
    'faq.q2': 'Comment préparer ma maison avant le sablage?',
    'faq.a2': 'Nous vous recommandons de retirer les meubles et objets de la pièce. Nous nous occupons de protéger les murs et les zones adjacentes.',
    'faq.q3': 'Y a-t-il une odeur après le sablage?',
    'faq.a3': 'Une légère odeur de vernis peut persister pendant quelques jours. Nous recommandons une bonne ventilation. Nos produits sont à faible émission de COV.',
    'faq.q4': 'Combien de temps avant de pouvoir marcher sur le plancher?',
    'faq.a4': 'Généralement, vous pouvez marcher délicatement sur le plancher après 24 heures. Le temps de cure complet est d\'environ 7 jours.',
    'faq.q5': 'Offrez-vous une garantie sur vos travaux?',
    'faq.a5': 'Oui, nous offrons une garantie sur tous nos travaux. Les détails vous seront fournis lors de la soumission.',
    'faq.q6': 'Quel est le meilleur moment pour faire sabler mon plancher?',
    'faq.a6': 'Le sablage peut être fait toute l\'année. Cependant, le printemps et l\'automne sont idéaux car l\'humidité est modérée.',
    'faq.q7': 'Puis-je changer la couleur de mon plancher?',
    'faq.a7': 'Absolument! Après le sablage, nous pouvons appliquer une teinture de la couleur de votre choix avant la couche de finition.',
    'faq.q8': 'Faites-vous le sablage d\'escaliers?',
    'faq.a8': 'Oui, nous offrons le sablage d\'escaliers en bois. Ce service demande une attention particulière que notre équipe maîtrise parfaitement.',

    // Footer
    'footer.quote': 'Soumission Gratuite',
    'footer.cta.description': 'Obtenez une estimation gratuite pour votre projet de sablage de plancher à Montréal.',
    'footer.brand.description': 'TALON PLANCHER – Experts en sablage de plancher, sablage d\'escalier et réparation de planchers de bois franc à Montréal, Rive-Sud et Rive-Nord.',
    'footer.trust.title': 'Pourquoi nous faire confiance',
    'footer.trust.1': 'Soumission gratuite et sans engagement',
    'footer.trust.2': 'Équipement professionnel de qualité supérieure',
    'footer.trust.3': 'Satisfaction garantie sur tous nos travaux',
    'footer.trust.4': 'Service rapide à Montréal et environs',
    'footer.contact': 'Coordonnées',
    'footer.links': 'Liens Rapides',
    'footer.rights': 'Tous droits réservés.',
  },
  en: {
    // Navigation
    'nav.services': 'Services',
    'nav.why': 'Why Us',
    'nav.process': 'Process',
    'nav.gallery': 'Gallery',
    'nav.testimonials': 'Testimonials',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.quote': 'Free Quote',

    // Hero
    'hero.title': 'Floor Sanding Experts',
    'hero.subtitle': 'Montreal and Surrounding Areas',
    'hero.description': 'Bring your hardwood floors back to life with our professional sanding service. Superior quality, impeccable results.',
    'hero.cta.quote': 'Request a Quote',
    'hero.cta.call': 'Call Us',

    // Form
    'form.title': 'Free Quote',
    'form.subtitle': 'Get your no-obligation estimate',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.phone': 'Phone',
    'form.email': 'Email',
    'form.address': 'Full Project Address',
    'form.postalCode': 'Postal Code',
    'form.city': 'City',
    'form.servicesTitle': 'Choose the desired service(s)',
    'form.service.floor': 'Floor Sanding',
    'form.service.stairs': 'Stair Sanding',
    'form.service.repair': 'Floor Repair',
    'form.date': 'Desired Work Date',
    'form.details': 'Please provide as many details as possible',
    'form.area': 'Approximate Project Area (sq ft)',
    'form.areaHelper': 'Width × Length (in feet) = total in square feet',
    'form.areaExample': 'Ex: 20 × 25 = 500 sq ft',
    'form.wantColor': 'Do you want to add color to your floor?',
    'form.colorYes': 'Yes',
    'form.colorNo': 'No',
    'form.floorType.label': 'Floor Type',
    'form.floorType.prefinished': 'Prefinished floor (never sanded, factory treated)',
    'form.floorType.regular': 'Regular floor (oak, maple, birch, parquetry, etc.)',
    'form.floorType.note': 'Prefinished floor = floor never sanded and already factory treated.',
    'form.stair.detailsLabel': 'Stair Details',
    'form.stair.marches': 'Number of treads',
    'form.stair.barreaux': 'Number of balusters',
    'form.stair.contremarches': 'Number of risers',
    'form.stair.poteaux': 'Number of posts',
    'form.stair.limon': 'Linear feet (lf) stringer',
    'form.stair.fauxLimon': 'Linear feet (lf) false stringer',
    'form.stair.mainCourante': 'Square feet handrail',
    'form.photos': 'Please include photos of your floor so we can provide a quick and accurate estimate',
    'form.photosMax': '10 max',
    'form.specialNeeds': 'Please describe any special needs if applicable',
    'form.submit': 'Submit',
    'form.submitting': 'Sending…',
    'form.uploadNote': 'Due to photo file sizes, upload may take a few extra seconds.',
    'form.success': 'Thank you! Your request has been sent successfully. We will contact you shortly.',
    'form.errorNetwork': 'Could not reach the server. Check your connection or try again later.',
    'form.errorServer': 'Something went wrong while sending. Please try again or call us.',
    'form.required': 'This field is required',
    'form.invalidEmail': 'Invalid email',
    'form.invalidPhone': 'Invalid phone number',
    'form.invalidPostalCode': 'Invalid postal code',
    'form.selectService': 'Please select at least one service',

    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Professional solutions for your hardwood floors',
    'services.floor.title': 'Floor Sanding',
    'services.floor.description': 'Restore the natural beauty of your hardwood floors. Our team uses professional techniques for a flawless finish.',
    'services.floor.benefits': 'Removal of scratches and imperfections • Custom stain application • Durable and resistant finish',
    'services.stairs.title': 'Stair Sanding',
    'services.stairs.description': 'Transform your wooden stairs with professional sanding. Each step receives special attention.',
    'services.stairs.benefits': 'Meticulous work on each step • Harmonization with your floors • Non-slip finish available',
    'services.repair.title': 'Floor Repair',
    'services.repair.description': 'Repair damage, replace damaged boards and correct imperfections before sanding.',
    'services.repair.benefits': 'Replacement of damaged boards • Correction of warped planks • Repair of joints and cracks',
    'services.cta': 'Request a Quote',

    // Why Us
    'why.title': 'Why Choose Us',
    'why.subtitle': 'Excellence at the service of your floors',
    'why.quality.title': 'Superior Quality',
    'why.quality.description': 'We use professional equipment and high-quality products for lasting results.',
    'why.detail.title': 'Attention to Detail',
    'why.detail.description': 'Every project receives meticulous attention, from corners to edges, for a perfect finish.',
    'why.timing.title': 'On-Time Delivery',
    'why.timing.description': 'We respect agreed timelines and keep you informed at every step.',
    'why.transparency.title': 'Transparency',
    'why.transparency.description': 'Clear pricing, no surprises. You know exactly what you are paying for.',
    'why.satisfaction.title': 'Satisfaction Guaranteed',
    'why.satisfaction.description': 'Your satisfaction is our priority. We do not leave until you are satisfied.',
    'why.experience.title': 'Proven Experience',
    'why.experience.description': 'Years of expertise in floor sanding in Montreal and surrounding areas.',

    // Process
    'process.title': 'Our Process',
    'process.subtitle': 'Methodical work for impeccable results',
    'process.step1.title': 'Evaluation',
    'process.step1.description': 'Free visit to assess the condition of your floors and establish a personalized work plan.',
    'process.step2.title': 'Preparation',
    'process.step2.description': 'Protection of walls, furniture and surface preparation for sanding.',
    'process.step3.title': 'Sanding',
    'process.step3.description': 'Professional sanding in multiple passes for a perfectly smooth surface.',
    'process.step4.title': 'Finishing',
    'process.step4.description': 'Application of stain (if desired) and high-quality protective varnish.',
    'process.step5.title': 'Inspection',
    'process.step5.description': 'Final verification with you to ensure your complete satisfaction.',

    // Gallery
    'gallery.title': 'Gallery',
    'gallery.subtitle': 'Discover our achievements',
    'gallery.before': 'Before',
    'gallery.after': 'After',

    // Testimonials
    'testimonials.title': 'Testimonials',
    'testimonials.subtitle': 'What our clients say',

    // Areas
    'areas.title': 'Service Areas',
    'areas.subtitle': 'We cover Montreal and surrounding areas',
    'areas.description': 'Our team travels throughout the greater Montreal area to offer you quality service.',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know',
    'faq.q1': 'How long does floor sanding take?',
    'faq.a1': 'Generally, floor sanding takes 2 to 4 days depending on the area and condition of the floor. This includes drying time between coats of varnish.',
    'faq.q2': 'How should I prepare my home before sanding?',
    'faq.a2': 'We recommend removing furniture and objects from the room. We take care of protecting walls and adjacent areas.',
    'faq.q3': 'Is there an odor after sanding?',
    'faq.a3': 'A slight varnish odor may persist for a few days. We recommend good ventilation. Our products are low VOC emission.',
    'faq.q4': 'How long before I can walk on the floor?',
    'faq.a4': 'Generally, you can walk gently on the floor after 24 hours. Full cure time is approximately 7 days.',
    'faq.q5': 'Do you offer a warranty on your work?',
    'faq.a5': 'Yes, we offer a warranty on all our work. Details will be provided with the quote.',
    'faq.q6': 'When is the best time to have my floor sanded?',
    'faq.a6': 'Sanding can be done year-round. However, spring and fall are ideal as humidity is moderate.',
    'faq.q7': 'Can I change the color of my floor?',
    'faq.a7': 'Absolutely! After sanding, we can apply a stain of your choice before the finish coat.',
    'faq.q8': 'Do you sand stairs?',
    'faq.a8': 'Yes, we offer wood stair sanding. This service requires special attention that our team has mastered.',

    // Footer
    'footer.quote': 'Free Quote',
    'footer.hours': 'Business Hours',
    'footer.hours.weekday': 'Monday - Friday: 8am - 6pm',
    'footer.hours.weekend': 'Saturday: 9am - 3pm',
    'footer.contact': 'Contact Info',
    'footer.links': 'Quick Links',
    'footer.rights': 'All rights reserved.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
