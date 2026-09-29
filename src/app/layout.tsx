import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/ui";

export const metadata: Metadata = {
  title: "SkillCase · Medical German for Nurses",
  description: "Practise beginner medical German (A1/A2) for nursing work in Germany.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0d9488" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
