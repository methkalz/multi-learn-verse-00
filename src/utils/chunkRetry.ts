/**
 * Chunk Loading Retry Utility
 * 
 * Handles failed dynamic imports in Vite by implementing retry logic
 * for chunk loading failures. This is essential for robust SPA navigation.
 */
import React from 'react';

export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  backoffMultiplier?: number;
}

/**
 * Retries a dynamic import if it fails due to chunk loading issues
 */
export const retryDynamicImport = async <T>(
  importFunction: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 1.5
  } = config;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await importFunction();
    } catch (error: any) {
      lastError = error;
      
      // Check if this is a chunk loading error
      const isChunkError = 
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.name === 'ChunkLoadError';

      // If it's not a chunk error or we've exhausted retries, throw immediately
      if (!isChunkError || attempt === maxRetries) {
        console.error(`Dynamic import failed after ${attempt} attempts:`, error);
        break;
      }

      // Calculate delay with backoff
      const currentDelay = delay * Math.pow(backoffMultiplier, attempt - 1);
      
      console.warn(`Chunk loading failed, retrying in ${currentDelay}ms (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  // If we get here, all retries failed
  throw new Error(`Failed to load module after ${maxRetries} attempts. Last error: ${lastError.message}`);
};

/**
 * Creates a lazy component with chunk retry logic
 */
export const createLazyComponentWithRetry = <T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  retryConfig?: RetryConfig
) => {
  return React.lazy(() => retryDynamicImport(importFunction, retryConfig));
};

/**
 * Global chunk error handler for Vite
 * This catches chunk loading errors at the window level
 */
export const setupGlobalChunkErrorHandler = () => {
  // Handle unhandled promise rejections from chunk loading
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    if (error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Loading chunk')) {
      console.warn('Global chunk loading error detected, attempting page reload:', error.message);
      
      // Prevent the default behavior
      event.preventDefault();
      
      // Reload the page as a last resort
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  });

  // Handle script loading errors
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLScriptElement;
    
    if (target?.tagName === 'SCRIPT' && target?.src?.includes('assets/')) {
      console.warn('Script loading error detected:', target.src);
      
      // Try to reload the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
};