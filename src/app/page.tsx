"use client"

import { useAuth } from "@/context/AuthContext"
import Header from "@/components/homepage/Header";
import HeroSection from "@/components/homepage/HeroSection";
import AboutSection from "@/components/homepage/AboutSection";
import ServicesSection from "@/components/homepage/ServicesSection";
import ContactSection from "@/components/homepage/ContactSection";
import Footer from "@/components/homepage/Footer";

export default function Home() {
    const { user } = useAuth();

    return (
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
            </main>

            <Footer />
        </div>
    )
}