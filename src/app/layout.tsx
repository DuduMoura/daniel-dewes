import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "WMS — Gestão de Armazém",
  description: "Sistema de gestão de armazém: estoque, localização e inventário.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
