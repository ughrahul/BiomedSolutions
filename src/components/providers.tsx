"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { AdminProfileProvider } from "@/contexts/AdminProfileContext";
import { MessageProvider } from "@/contexts/MessageContext";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <AdminProfileProvider>
          <MessageProvider>
            {children}
          </MessageProvider>
        </AdminProfileProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
