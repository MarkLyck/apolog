import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { ReactNode } from "react";

import { ConvexClientProvider } from "@/app/(auth)/convex-client-provider";
import { AdminAccess } from "@/components/admin-access";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <AdminAccess>{children}</AdminAccess>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
