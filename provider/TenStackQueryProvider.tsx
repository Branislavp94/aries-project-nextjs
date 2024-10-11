// provider/TenStackQueryProvider.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function TenStackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  // Create a client with default options
  const queryClient = new QueryClient({
    // Note: cacheTime and staleTime are no longer in the default options
  });

  // Set global default options for queries
  queryClient.setDefaultOptions({
    queries: {
      staleTime: Infinity, // Prevent refetching since Socket.IO handles real-time updates
      // cacheTime is now managed differently, see below
      refetchOnWindowFocus: false, // Prevent refetching on window focus
    },
  });

  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
