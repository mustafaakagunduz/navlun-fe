import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster"
import ReduxProvider from "@/providers/ReduxProvider"
import BackgroundImage from "@/components/BackgroundImage";

export const metadata: Metadata = {
  title: "TRANSYÜK - Türkiye'nin En Güvenilir Nakliye ve Lojistik Platformu",
  description: "TRANSYÜK ile güvenli, hızlı ve ekonomik nakliye hizmeti. Yük taşımacılığı, lojistik çözümleri ve nakliye platformu. Türkiye geneli güvenilir taşımacılık hizmeti.",
  keywords: "nakliye, lojistik, yük taşımacılığı, taşımacılık, kargo, transyük, transport, shipping, logistics",
  authors: [{ name: "TRANSYÜK" }],
  creator: "TRANSYÜK",
  publisher: "TRANSYÜK",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://transyuk.com",
    siteName: "TRANSYÜK",
    title: "TRANSYÜK - Türkiye'nin En Güvenilir Nakliye ve Lojistik Platformu",
    description: "TRANSYÜK ile güvenli, hızlı ve ekonomik nakliye hizmeti. Yük taşımacılığı, lojistik çözümleri ve nakliye platformu.",
    images: [
      {
        url: "https://transyuk.com/assets/images/transyuk.png",
        width: 1200,
        height: 630,
        alt: "TRANSYÜK - Nakliye ve Lojistik Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRANSYÜK - Türkiye'nin En Güvenilir Nakliye ve Lojistik Platformu",
    description: "TRANSYÜK ile güvenli, hızlı ve ekonomik nakliye hizmeti. Yük taşımacılığı, lojistik çözümleri ve nakliye platformu.",
    images: ["https://transyuk.com/assets/images/transyuk.png"],
  },
  alternates: {
    canonical: "https://transyuk.com",
  },
};
//comment
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


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