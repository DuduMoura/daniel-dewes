import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";
import { countUnreadAlerts } from "@/modules/alerts/queries";

export const metadata: Metadata = {
  title: "WMS — Gestão de Armazém",
  description: "Sistema de gestão de armazém: estoque, localização e inventário.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Busca contagem de alertas não lidos para GESTOR e COMPRAS
  let unreadAlerts = 0;
  if (session && (session.role === "GESTOR" || session.role === "COMPRAS")) {
    const user = await import("@/lib/db").then((m) =>
      m.db.user.findUnique({
        where: { id: session.id },
        select: { alertsLastSeenAt: true },
      }),
    );
    unreadAlerts = await countUnreadAlerts(session.id, user?.alertsLastSeenAt ?? null);
  }

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">
        <div className="flex h-screen">
          <AppSidebar user={session} unreadAlerts={unreadAlerts} />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
