/**
 * Formats a number as Indian Rupee currency.
 * @param {number} amount - The amount to format
 * @param {boolean} [showSymbol=true] - Whether to prefix with ₹
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) return showSymbol ? '₹0' : '0';
  const formatted = Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Formats a date string into a human-readable format.
 * @param {string|Date} date - The date to format
 * @param {Object} [options] - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Formats a payment date and time.
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date-time string
 */
export function formatPaymentDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
