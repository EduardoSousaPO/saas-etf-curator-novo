'use client';

import { useEffect } from 'react';

export function useChunkLoadErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.message?.includes('Failed to import') ||
        event.message?.includes('Loading chunk')
      ) {
        console.warn('ChunkLoadError detected, reloading page...', error);
        
        // Prevent the default error handling
        event.preventDefault();
        
        // Reload the page to get fresh chunks
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.message?.includes('Failed to import')
      ) {
        console.warn('ChunkLoadError in promise rejection, reloading page...', error);
        
        // Prevent the default error handling
        event.preventDefault();
        
        // Reload the page to get fresh chunks
        window.location.reload();
      }
    };

    // Listen for JavaScript errors
    window.addEventListener('error', handleError);
    
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

export default useChunkLoadErrorHandler; 