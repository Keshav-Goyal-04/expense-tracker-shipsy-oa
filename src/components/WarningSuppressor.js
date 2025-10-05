'use client';

import { useEffect } from 'react';

export default function WarningSuppressor({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn;
      console.warn = function(...args) {
        const message = args[0];
        if (typeof message === 'string' && message.includes('OperationContainer')) {
          return; // Suppress this warning
        }
        originalWarn.apply(console, args);
      };

      return () => {
        console.warn = originalWarn;
      };
    }
  }, []);

  return <>{children}</>;
}
