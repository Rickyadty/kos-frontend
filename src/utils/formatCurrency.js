/**
 * Format number as Indonesian Rupiah currency
 * @param {number} amount
 * @returns {string} e.g. "Rp1.000.000"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
