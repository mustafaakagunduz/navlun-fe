// pages/index.tsx
"use client"

import { useState, useEffect } from "react"
import Header from "@/components/homepage/Header";
import HeroSection from "@/components/homepage/HeroSection";
import AboutSection from "@/components/homepage/AboutSection";
import ServicesSection from "@/components/homepage/ServicesSection";
import ContactSection from "@/components/homepage/ContactSection";
import Footer from "@/components/homepage/Footer";
import ReactConfetti from "react-confetti"

export default function Home() {
    // Konfeti efekti için statesi
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [confettiSize, setConfettiSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

    // Sayfa yüklendiğinde viewport boyutunu ayarla
    useEffect(() => {
        setConfettiSize({
            width: window.innerWidth,
            height: window.innerHeight,
        })

        const handleResize = () => {
            setConfettiSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="flex min-h-screen flex-col">
            {/* Konfeti efekti */}
            {showConfetti && (
                <ReactConfetti
                    width={confettiSize.width}
                    height={confettiSize.height}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.2}
                />
            )}

            <Header />

            <main className="flex-1">
                <HeroSection
                    setShowConfetti={setShowConfetti}
                    setConfettiSize={setConfettiSize}
                />
                <AboutSection />
                <ServicesSection />
                <ContactSection />
            </main>

            <Footer />
        </div>
    )
}