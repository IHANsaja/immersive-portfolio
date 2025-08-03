import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ToasterProvider from "@/components/Ui/ToasterProvider";

const InconsolataSans = Inconsolata({
    variable: "--font-inconsolata-sans",
    subsets: ["latin"],
});

const NeotriadSans = localFont({
    variable: "--font-neotriad-sans",
    src: "../public/fonts/Neotriad.otf", // Double-check this path relative to layout.tsx
    display: 'swap', // Recommended for better performance/user experience
});

const AndvariSans = localFont({
    variable: '--font-andvari-sans',
    src: '../public/fonts/andvari.ttf', // ✅ Correct path relative to the file in `app` or `pages`
    display: 'swap',
});

export const metadata: Metadata = {
  title: "Ihan Hansaja",
  description: "Portfolio of Ihan Hansaja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${InconsolataSans.variable} ${NeotriadSans.variable} ${AndvariSans.variable} antialiased`}
      >
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
