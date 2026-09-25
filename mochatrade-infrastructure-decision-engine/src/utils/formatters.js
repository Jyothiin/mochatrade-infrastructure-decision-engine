/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format score out of 10 or 100 with fallback
 */
export function formatScore(score, max = 10) {
  if (typeof score !== 'number' || isNaN(score)) return '-';
  return `${score.toFixed(0)}/${max}`;
}

/**
 * Format percentage
 */
export function formatPercent(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0%';
  return `${Math.round(val)}%`;
}

/**
 * Format ISO date string into readable meeting/memo date
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateString);
  }
}
