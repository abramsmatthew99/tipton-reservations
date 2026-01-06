import { differenceInDays, format, parseISO } from 'date-fns';

/**
 * Calculate number of nights between two dates
 * @param checkIn - ISO date string (YYYY-MM-DD)
 * @param checkOut - ISO date string (YYYY-MM-DD)
 * @returns Number of nights
 */
export const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  return differenceInDays(end, start);
};

/**
 * Format date for display
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Wed, Jan 15, 2026")
 */
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'EEE, MMM d, yyyy');
};
