/** Format amounts in Ethiopian Birr (ETB). */
export function formatPriceETB(price: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(price);
}
