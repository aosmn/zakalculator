export type Gradient = [string, string];

export const G = {
  teal:      ['#0D9488', '#0F766E'] as Gradient,  // brand primary
  tealDeep:  ['#0D9488', '#065F46'] as Gradient,  // deep forest teal
  tealCyan:  ['#0E7490', '#06B6D4'] as Gradient,  // vibrant teal → cyan
  tealGrand: ['#0F766E', '#0D9488'] as Gradient,  // overview grand total
  tealDark:  ['#0D3347', '#111827'] as Gradient,  // overview total rows
  cyan:      ['#0891B2', '#06B6D4'] as Gradient,
  cyanDeep:  ['#0E7490', '#0891B2'] as Gradient,
  emerald:   ['#059669', '#10B981'] as Gradient,
  red:       ['#DC2626', '#EF4444'] as Gradient,
  lime:      ['#65A30D', '#84CC16'] as Gradient,
  amber:     ['#D97706', '#F59E0B'] as Gradient,
  pink:      ['#DB2777', '#EC4899'] as Gradient,
  gold:      ['#FBBF24', '#F59E0B'] as Gradient,
  silver:    ['#D1D5DB', '#9CA3AF'] as Gradient,
  silverAlt: ['#9CA3AF', '#6B7280'] as Gradient,  // silver empty state
  indigo:    ['#4F46E5', '#6366F1'] as Gradient,  // cash breakdown card
  danger:    ['#EF4444', '#DC2626'] as Gradient,
  disabled:  ['#D1D5DB', '#9CA3AF'] as Gradient,
};

// Ordered palette for deterministic currency icon colour assignment
export const CURRENCY_GRADIENTS: Gradient[] = [
  G.cyan,
  G.emerald,
  G.red,
  G.lime,
  G.amber,
  G.pink,
  G.teal,
  G.cyanDeep,
];
