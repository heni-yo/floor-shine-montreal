import { describe, expect, it } from 'vitest';
import {
  computeQuote,
  createInitialState,
  floorArea,
  floorRate,
  newReference,
  parseNum,
  restoreState,
  type CalcState,
} from './quoteCalculator';

function staircaseJob(): CalcState {
  const s = createInitialState('fr', new Date('2026-10-16T18:32:00Z'));
  s.stain = true;
  s.floor.area = '400';
  s.floor.rate = String(floorRate(true, false));
  s.stairs.enabled = true;
  const qty = { marches: '14', contremarches: '15', mainCourante: '16', limon: '15', fauxLimon: '18', barreaux: '28', poteaux: '1' };
  for (const [k, v] of Object.entries(qty)) s.stairs.items[k as keyof typeof qty].qty = v;
  return s;
}

describe('quoteCalculator', () => {
  it('lit les nombres saisis à la française comme à l’anglaise', () => {
    expect(parseNum('4,75')).toBe(4.75);
    expect(parseNum('4.75')).toBe(4.75);
    expect(parseNum('1 200')).toBe(1200);
    expect(parseNum('')).toBe(0);
    expect(parseNum('-3')).toBe(0);
    expect(parseNum('abc')).toBe(0);
  });

  it('applique les tarifs plancher du formulaire public', () => {
    expect(floorRate(false, false)).toBe(3);
    expect(floorRate(true, false)).toBe(4);
    expect(floorRate(true, true)).toBe(4.75);
  });

  it('calcule plancher + escalier complet avec TPS et TVQ', () => {
    const q = computeQuote(staircaseJob());
    expect(q.lines).toHaveLength(8);
    expect(q.subtotal).toBe(3635);
    expect(q.gst).toBe(181.75);
    expect(q.qst).toBe(362.59);
    expect(q.total).toBe(4179.34);
  });

  it('applique le rabais avant les taxes et le plafonne', () => {
    const s = staircaseJob();
    s.discount = { value: '10', mode: 'percent' };
    expect(computeQuote(s).afterDiscount).toBe(3271.5);
    s.discount = { value: '99999', mode: 'amount' };
    expect(computeQuote(s).total).toBe(0);
  });

  it('retire les taxes à la demande', () => {
    const s = staircaseJob();
    s.taxes = false;
    expect(computeQuote(s).total).toBe(3635);
  });

  it('ignore les sections désactivées et les lignes vides', () => {
    const s = staircaseJob();
    s.stairs.enabled = false;
    s.extras = [{ id: 'x', label: '', qty: '1', rate: '' }];
    expect(computeQuote(s).lines.map((l) => l.id)).toEqual(['floor']);
  });

  it('additionne les pièces mesurées à la place de la superficie saisie', () => {
    const s = createInitialState();
    s.floor.area = '999';
    s.floor.rooms = [
      { id: 'a', name: 'Salon', length: '15', width: '12,5' },
      { id: 'b', name: 'Chambre', length: '11', width: '10' },
    ];
    expect(floorArea(s.floor)).toBe(297.5);
  });

  it('numérote dans le fuseau de Montréal', () => {
    expect(newReference(new Date('2026-10-16T18:32:00Z'))).toBe('TP-261016-1432');
  });

  it('restaure un brouillon partiel sans planter', () => {
    const restored = restoreState({ version: 1, lang: 'en', client: { name: 'Juliette' }, stairs: { enabled: true } });
    expect(restored?.client.name).toBe('Juliette');
    expect(restored?.client.phone).toBe('');
    expect(restored?.stairs.items.marches.rate).toBe('35');
    expect(restoreState({ version: 2 })).toBeNull();
    expect(restoreState('garbage')).toBeNull();
  });
});
