"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "./LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"
import Image from 'next/image'
const NavbarWithoutLogin = () => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={`sticky top-0 z-40 w-full transition-all duration-300 ${
                isScrolled
                    ? "bg-white/95 backdrop-blur-md border-b shadow-sm"
                    : "bg-transparent"
            }`}
        >
            <div className="flex h-16 items-center justify-between px-3 sm:px-4 w-full">
                <div className={`flex items-center gap-2 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                    <Image
                        src="/assets/images/transyuk.png"
                        alt="TRANSYÜK Logo"
                        width={120}
                        height={32}
                        className="h-8 w-auto"
                    />
                </div>
                <nav className="hidden lg:flex gap-6">
                    <Link href="#hero" className={`text-base font-semibold transition-colors ${
                        isScrolled
                            ? 'text-gray-700 hover:text-green-600'
                            : 'text-white hover:text-green-400'
                    }`}>
                        {t("navbar.home")}
                    </Link>
                    <Link href="#about" className={`text-base font-semibold transition-colors ${
                        isScrolled
                            ? 'text-gray-700 hover:text-green-600'
                            : 'text-white hover:text-green-400'
                    }`}>
                        {t("navbar.about")}
                    </Link>
                    <Link href="#services" className={`text-base font-semibold transition-colors ${
                        isScrolled
                            ? 'text-gray-700 hover:text-green-600'
                            : 'text-white hover:text-green-400'
                    }`}>
                        {t("navbar.services")}
                    </Link>
                    <Link href="#contact" className={`text-base font-semibold transition-colors ${
                        isScrolled
                            ? 'text-gray-700 hover:text-green-600'
                            : 'text-white hover:text-green-400'
                    }`}>
                        {t("navbar.contact")}
                    </Link>
                </nav>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link href="/login">
                            <Button className="bg-green-600 hover:bg-green-700">
                                {t("navbar.login")}
                            </Button>
                        </Link>
                    </div>
                    
                    <button
                        className="lg:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className={`h-6 w-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                        ) : (
                            <Menu className={`h-6 w-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                        )}
                    </button>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={`lg:hidden border-t ${
                    isScrolled 
                        ? 'bg-white/95 backdrop-blur-md border-gray-200' 
                        : 'bg-black/20 backdrop-blur-md border-white/20'
                }`}>
                    <div className="px-3 py-4 space-y-3">
                        <Link 
                            href="#hero" 
                            className={`block text-base font-semibold transition-colors ${
                                isScrolled
                                    ? 'text-gray-700 hover:text-green-600'
                                    : 'text-white hover:text-green-400'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t("navbar.home")}
                        </Link>
                        <Link 
                            href="#about" 
                            className={`block text-base font-semibold transition-colors ${
                                isScrolled
                                    ? 'text-gray-700 hover:text-green-600'
                                    : 'text-white hover:text-green-400'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t("navbar.about")}
                        </Link>
                        <Link 
                            href="#services" 
                            className={`block text-base font-semibold transition-colors ${
                                isScrolled
                                    ? 'text-gray-700 hover:text-green-600'
                                    : 'text-white hover:text-green-400'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t("navbar.services")}
                        </Link>
                        <Link
                            href="#contact"
                            className={`block text-base font-semibold transition-colors ${
                                isScrolled
                                    ? 'text-gray-700 hover:text-green-600'
                                    : 'text-white hover:text-green-400'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t("navbar.contact")}
                        </Link>
                        
                        <div className="pt-3 border-t border-gray-300/30 space-y-3">
                            <div className="flex justify-center">
                                <LanguageSwitcher />
                            </div>
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    {t("navbar.login")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default NavbarWithoutLogin