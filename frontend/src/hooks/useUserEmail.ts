import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseUserEmailResult {
  email: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch user email by userId
 * Follows the pattern from GuestInfoCard.tsx
 */
export const useUserEmail = (userId: string | undefined): UseUserEmailResult => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const response = await axios.get(
          `${baseUrl}/users/email/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmail(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user email:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [userId]);

  return { email, loading, error };
};
