// components/NavbarWithoutLogin.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"

const NavbarWithoutLogin = () => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false)

    // Sayfa kaydırıldığında navbarın arkaplan rengini değiştir
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            if (scrollPosition > 20) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        // Scroll event listener'ı ekle
        window.addEventListener("scroll", handleScroll)

        // Component unmount olduğunda event listener'ı temizle
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
        <header
            className={`sticky top-0 z-40 w-full transition-all duration-300 ${
                isScrolled
                    ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm"
                    : "bg-gradient-to-b from-green-50 to-white border-transparent"
            }`}
        >
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold">EkoTaşıma</span>
                </div>
                <nav className="hidden md:flex gap-6">
                    <Link href="#hero" className="text-sm font-medium hover:text-green-600 transition-colors">
                        Ana Sayfa
                    </Link>
                    <Link href="#about" className="text-sm font-medium hover:text-green-600 transition-colors">
                        Hakkımızda
                    </Link>
                    <Link href="#services" className="text-sm font-medium hover:text-green-600 transition-colors">
                        Hizmetlerimiz
                    </Link>
                    <Link href="#contact" className="text-sm font-medium hover:text-green-600 transition-colors">
                        İletişim
                    </Link>
                </nav>
                <Button className="bg-green-600 hover:bg-green-700">Teklif Al</Button>
            </div>
        </header>
    )
}

export default NavbarWithoutLogin