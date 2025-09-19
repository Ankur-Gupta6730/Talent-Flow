"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useEffect, useRef } from "react";
import { startWorker } from "@/mocks/browser";
import { ensureSeeded } from "@/lib/seed";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Global initialization state - runs in background without blocking UI
declare global {
  interface Window {
    __TALENTFLOW_INIT_STARTED__?: boolean;
  }
}

// Background initialization - non-blocking
const initializeInBackground = () => {
  if (typeof window === 'undefined') return;
  
  // Prevent multiple initializations
  if (window.__TALENTFLOW_INIT_STARTED__) return;
  window.__TALENTFLOW_INIT_STARTED__ = true;

  // Run initialization in background without blocking UI
  (async () => {
    try {
      console.log("🚀 Starting TalentFlow background initialization...");
      
      // Start MSW service worker
      await startWorker();
      
      // Small delay to ensure MSW is fully ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Seed the database
      await ensureSeeded();
      
      console.log("✅ TalentFlow background initialization completed");
    } catch (error) {
      console.error("❌ Background initialization failed:", error);
      // Continue silently - app will work with fallbacks
    }
  })();
};

export default function AppProviders({ children }: { children: ReactNode }) {
  const clientRef = useRef<QueryClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: false, // Prevent refetch on navigation
          refetchOnReconnect: false,
          retry: 2, // Increased retry for better resilience
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
          gcTime: 15 * 60 * 1000, // 15 minutes - keep in memory longer
          networkMode: 'offlineFirst', // Prefer cache over network
        },
        mutations: {
          retry: 1,
          networkMode: 'online',
        },
      },
    });
  }

  // Start background initialization on mount - non-blocking
  useEffect(() => {
    initializeInBackground();
  }, []);

  // Always render children immediately - no blocking loader
  return (
    <ErrorBoundary>
      <QueryClientProvider client={clientRef.current}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}