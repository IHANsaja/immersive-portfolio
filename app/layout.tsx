import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ToasterProvider from "@/components/Ui/ToasterProvider";
import PreloaderWrapper from "@/components/Ui/PreloaderWrpper";
import {MusicProvider} from "@/components/Ui/MusicProvider"; // 1. Import the wrapper

const InconsolataSans = Inconsolata({
    variable: "--font-inconsolata-sans",
    subsets: ["latin"],
});

const NeotriadSans = localFont({
    variable: "--font-neotriad-sans",
    src: "../public/fonts/Neotriad.otf",
    display: 'swap',
});

const AndvariSans = localFont({
    variable: '--font-andvari-sans',
    src: '../public/fonts/andvari.ttf',
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
            className={`${InconsolataSans.variable} ${NeotriadSans.variable} ${AndvariSans.variable} antialiased bg-background`} // Added bg-background for seamless transition
        >
        <ToasterProvider />
        {/* 2. Wrap the children with the PreloaderWrapper */}
        <MusicProvider>
            <PreloaderWrapper>
                {children}
            </PreloaderWrapper>
        </MusicProvider>
        </body>
        </html>
    );
}