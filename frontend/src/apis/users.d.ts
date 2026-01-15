/**
 * User summary with role information
 * Returned by getUsers() API - filtered to customers only
 */
export type UserSummary = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: string[]; // Array of role strings like "ROLE_CUSTOMER", "ROLE_ADMIN"
};

/**
 * Fetch all users with ROLE_CUSTOMER from backend
 */
export function getUsers(): Promise<UserSummary[]>;
