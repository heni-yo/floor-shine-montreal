/**
 * Tarifs centralisés — sablage plancher et escalier (modifiables ici).
 */
export const FLOOR_RATE_PER_SQFT = {
  /** Sans teinte (sans vernis au formulaire) */
  noColorNoVarnish: 3.0,
  /** Avec teinte (sans vernis au formulaire) */
  colorNoVarnish: 4.0,
  /** Référence si vous réintroduisez le choix vernis */
  colorWithVarnish: 4.75,
  noColorWithVarnish: 3.5,
} as const;

/** Supplément au pi² lorsque le plancher est préverni (jamais sablé, usine). */
export const PREFINISHED_FLOOR_SURCHARGE_PER_SQFT = 0.75;

/**
 * Sablage d’escalier — tarif par unité ou par pied linéaire (pi lin.).
 * Clés alignées sur les champs du formulaire (stairDetails).
 */
export const STAIR_RATES = {
  marches: { label: 'Marche', ratePerUnit: 35, per: 'unité' as const },
  contremarches: { label: 'Contremarche', ratePerUnit: 30, per: 'unité' as const },
  mainCourante: { label: 'Main courante', ratePerUnit: 15, per: 'pi_lin' as const },
  limon: { label: 'Limon', ratePerUnit: 15, per: 'pi_lin' as const },
  fauxLimon: { label: 'Faux limon', ratePerUnit: 15, per: 'pi_lin' as const },
  barreaux: { label: 'Barreau', ratePerUnit: 10, per: 'unité' as const },
  poteaux: { label: 'Poteau', ratePerUnit: 80, per: 'unité' as const },
} as const;

export type StairDetailKey = keyof typeof STAIR_RATES;
