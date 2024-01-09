'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function TenStackQueryProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {

  // Create a client
  const queryClient = new QueryClient()

  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}