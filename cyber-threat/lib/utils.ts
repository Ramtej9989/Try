import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 * Useful for conditionally applying Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to a human readable format
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch (e) {
    return dateStr;
  }
}

/**
 * Returns a color based on a severity value (1-10)
 */
export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'text-red-600';
  if (severity >= 6) return 'text-orange-600';
  if (severity >= 4) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Returns a background color based on a severity value (1-10)
 */
export function getSeverityBgColor(severity: number): string {
  if (severity >= 8) return 'bg-red-100 text-red-800';
  if (severity >= 6) return 'bg-orange-100 text-orange-800';
  if (severity >= 4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Format bytes to human readable format (KB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}
