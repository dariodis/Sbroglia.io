import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sbroglia.ai — Life Admin AI Assistant",
  description:
    "Togliti tutto il carico mentale. Descrivi cosa devi fare e Sbroglia.ai organizza per te.",
  icons: {
    icon: "/sbroglia-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
