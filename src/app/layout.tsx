import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/session-provider";
import ProtectedPage from "@/components/auth/protected-page";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tudú - Tus pendientes en un solo lugar",
  description: "Organiza y gestiona todas tus tareas de manera simple y elegante. Tudú te ayuda a mantener tus pendientes en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ProtectedPage>
            {children}
          </ProtectedPage>
        </Providers>
      </body>
    </html>
  );
}
// Force recompile
