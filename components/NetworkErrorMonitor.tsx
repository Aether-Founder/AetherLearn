'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const delays = [250, 750, 1750];

export function NetworkErrorMonitor() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      let lastError: unknown;
      for (let attempt = 0; attempt <= delays.length; attempt += 1) {
        try {
          const response = await originalFetch(input, init);
          if (response.status < 500 || attempt === delays.length) return response;
          lastError = new Error(`Server response ${response.status}`);
        } catch (error) {
          lastError = error;
        }
        await new Promise((resolve) => window.setTimeout(resolve, delays[attempt]));
      }
      toast.error('Verbinding mislukt. Controleer je internetverbinding en probeer opnieuw.');
      throw lastError;
    };
    return () => { window.fetch = originalFetch; };
  }, []);
  return null;
}
