import { z } from 'zod';

const yesNoEmpty = z.enum(['yes', 'no', '']).optional().default('');

const stairDetailsSchema = z.object({
  marches: z.string().max(32).optional().default(''),
  barreaux: z.string().max(32).optional().default(''),
  contremarches: z.string().max(32).optional().default(''),
  poteaux: z.string().max(32).optional().default(''),
  limon: z.string().max(32).optional().default(''),
  fauxLimon: z.string().max(32).optional().default(''),
  mainCourante: z.string().max(32).optional().default(''),
});

export const quotePayloadSchema = z
  .object({
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(40),
    email: z.string().trim().email().max(320),
    address: z.string().trim().min(1).max(500),
    postalCode: z.string().trim().min(1).max(12),
    city: z.string().trim().min(1).max(120),
    services: z.object({
      floor: z.boolean(),
      stairs: z.boolean(),
      repair: z.boolean(),
    }),
    floorType: z.enum(['regular', 'prefinished', '']).default(''),
    stairDetails: stairDetailsSchema.default({}),
    date: z.string().min(1).max(32),
    details: z.string().max(8000).optional().default(''),
    area: z.string().trim().max(32).optional().default(''),
    wantColor: yesNoEmpty,
    specialNeeds: z.string().max(8000).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.services.floor && data.floorType !== 'regular' && data.floorType !== 'prefinished') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type de plancher requis lorsque le sablage de plancher est sélectionné.',
        path: ['floorType'],
      });
    }
    if (data.services.floor && data.area.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Superficie requise lorsque le sablage de plancher est sélectionné.',
        path: ['area'],
      });
    }
  });

export type QuotePayload = z.infer<typeof quotePayloadSchema>;

export function parseQuotePayload(raw: unknown) {
  return quotePayloadSchema.safeParse(raw);
}
