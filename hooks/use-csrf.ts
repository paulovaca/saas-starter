import { useEffect, useState } from 'react';

export function useCSRF() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/csrf-token');
        
        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }
        
        const data = await response.json();
        setToken(data.token);
        setError(null);
      } catch (err) {
        console.error('Error fetching CSRF token:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCSRFToken();
  }, []);

  return { token, loading, error };
}

// Helper function to add CSRF token to fetch requests
export function fetchWithCSRF(url: string, options: RequestInit = {}) {
  return async (csrfToken: string) => {
    const headers = new Headers(options.headers);
    headers.set('x-csrf-token', csrfToken);

    return fetch(url, {
      ...options,
      headers
    });
  };
}