import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import { Providers } from "@/components/providers/session-provider";
import ProtectedPage from "@/components/auth/protected-page";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LA NORIA - Gestión Elegante de Bodas y Eventos",
  description: "Sistema especializado de gestión para bodas y eventos. Organiza tu día especial con elegancia y estilo.",
  keywords: "bodas, wedding planner, eventos, gestión, La Noria",
  authors: [{ name: "La Noria" }],
  openGraph: {
    title: "LA NORIA",
    description: "Sistema especializado de gestión para bodas y eventos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${cormorantGaramond.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
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
