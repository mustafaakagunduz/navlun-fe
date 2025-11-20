"use client"

import { useAuth } from "@/context/AuthContext"
import Header from "@/components/homepage/Header";
import HeroSection from "@/components/homepage/HeroSection";
import AboutSection from "@/components/homepage/AboutSection";
import ServicesSection from "@/components/homepage/ServicesSection";
import ContactSection from "@/components/homepage/ContactSection";
import Footer from "@/components/homepage/Footer";
import Script from "next/script";

export default function Home() {
    const { user, isLoading } = useAuth();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "TRANSYÜK",
        "url": "https://transyuk.com",
        "logo": "https://transyuk.com/assets/images/transyuk.png",
        "description": "Türkiye'nin en güvenilir nakliye ve lojistik platformu. Güvenli, hızlı ve ekonomik nakliye hizmeti.",
        "foundingDate": "2024",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["Turkish", "English"]
        },
        "areaServed": "Turkey",
        "serviceType": "Logistics and Transportation",
        "sameAs": [
            "https://transyuk.com"
        ]
    };

    // Loading state - kullanıcı durumu yüklenirken loading göster
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }
    //
    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />
            <div className="flex min-h-screen flex-col">
                <Header />

                <main className="flex-1">
                    {/* Login olmamış kullanıcılar hero section'ı görür */}
                    {!user && <HeroSection />}

                    {/* Login olmuş kullanıcılar için boşluk bırak */}
                    {user && <div className="h-20"></div>}

                    <AboutSection />
                    <ServicesSection />
                    <ContactSection />
                    <Footer />
                </main>


            </div>
        </>
    )
}