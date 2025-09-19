import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Only create worker in browser environment
export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null

// Global flag to track MSW readiness
declare global {
  interface Window {
    __MSW_READY__?: boolean;
  }
}

export async function startWorker() {
  if (typeof window === 'undefined' || !worker) {
    return
  }

  // Prevent multiple initializations
  if (window.__MSW_READY__) {
    console.log('🔧 MSW already initialized, skipping...')
    return
  }

  try {
    console.log('🔧 Starting MSW service worker...')
    
    await worker.start({
      quiet: true,
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
        },
      },
    })

    // Quick check for service worker activation
    let attempts = 0
    const maxAttempts = 5 // Further reduced for faster startup
    
    while (attempts < maxAttempts) {
      if (navigator.serviceWorker?.controller) {
        console.log('✅ MSW service worker activated')
        window.__MSW_READY__ = true
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 50)) // Faster polling
      attempts++
    }
    
    // Mark as ready even if not fully activated - graceful degradation
    window.__MSW_READY__ = true
    console.log('⚠️ MSW service worker may not be fully activated, but marked as ready')
  } catch (error) {
    console.error('❌ Failed to start MSW service worker:', error)
    // Don't throw - allow app to continue with potential fallbacks
    window.__MSW_READY__ = true // Mark as "ready" to prevent retries
  }
}

export function isMSWReady(): boolean {
  return typeof window !== 'undefined' && window.__MSW_READY__ === true
}