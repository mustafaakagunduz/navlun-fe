"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "./LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"

const NavbarWithoutLogin = () => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false)
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
            <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
                <div className={`flex items-center gap-2 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                    <Leaf className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold">Transyük</span>
                </div>
                <nav className="hidden md:flex gap-6">
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
                    <LanguageSwitcher />
                    <Link href="/login">
                        <Button className="bg-green-600 hover:bg-green-700">
                            {t("navbar.login")}
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default NavbarWithoutLogin