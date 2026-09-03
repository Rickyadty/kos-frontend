/**
 * Format date string to Indonesian locale
 * @param {string} dateStr - ISO date string or YYYY-MM-DD
 * @returns {string} e.g. "01 September 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format period string YYYY-MM to "September 2026"
 * @param {string} periode - YYYY-MM
 * @returns {string}
 */
export function formatPeriode(periode) {
  if (!periode) return '-';
  const [year, month] = periode.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current period as YYYY-MM string
 */
export function getCurrentPeriode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
