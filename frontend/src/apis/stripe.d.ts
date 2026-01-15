/**
 * Monthly revenue as number or string decimal
 */
export type MonthlyRevenue = string | number;

/**
 * Get total revenue for the current month
 * Returns a number or string representing dollar amount
 */
export function getThisMonthsRevenue(): Promise<MonthlyRevenue>;
