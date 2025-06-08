"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster"
import ReduxProvider from "@/providers/ReduxProvider"
import Image from "next/image";
import { usePathname } from "next/navigation";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Arkaplan komponenti
function BackgroundImage() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Sadece ana sayfada ve login olmamış kullanıcılar için göster
    const shouldShowBackground = pathname === "/" && !user;

    if (!shouldShowBackground) return null;

    return (
        <div className="fixed inset-0 z-0">
            <Image
                src="/assets/images/eco-trans.webp"
                alt="Ekolojik taşımacılık - Otoyolda kamyonlar"
                fill
                className="object-cover object-center"
                priority
                quality={90}
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
    );
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ReduxProvider>
            <AuthProvider>
                <LanguageProvider>
                    <BackgroundImage />
                    <div className="relative z-10">
                        {children}
                    </div>
                </LanguageProvider>
            </AuthProvider>
        </ReduxProvider>
        <Toaster />
        </body>
        </html>
    );
}