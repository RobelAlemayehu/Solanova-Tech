export function formatPriceETB(price: number): string {
  return `${new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(price)} ETB`;
}
