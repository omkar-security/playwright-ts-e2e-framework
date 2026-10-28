import { TAX_RATE } from '../data/products';

/** "$29.99" or "Item total: $29.99" -> 29.99 */
export function parsePrice(text: string): number {
  const match = text.match(/\$?(\d+(?:\.\d{1,2})?)\s*$/);
  if (!match) throw new Error(`Could not parse a price from "${text}"`);
  return Number(match[1]);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateOrderTotals(prices: number[]) {
  const subtotal = round2(prices.reduce((sum, p) => sum + p, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  return { subtotal, tax, total };
}
