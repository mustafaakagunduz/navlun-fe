"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "./LanguageSwitcher"
import { useLanguage } from "@/app/context/LanguageContext"
import AuthForms from "@/app/components/auth/AuthForms";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"


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
                    ? "bg-white border-b shadow-sm"
                    : "bg-green-50"
            }`}
        >
            <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl">
                <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold">EkoTaşıma</span>
                </div>
                <nav className="hidden md:flex gap-6">
                    <Link href="#hero" className="text-sm font-medium hover:text-green-600 transition-colors">
                        {t("navbar.home")}
                    </Link>
                    <Link href="#about" className="text-sm font-medium hover:text-green-600 transition-colors">
                        {t("navbar.about")}
                    </Link>
                    <Link href="#services" className="text-sm font-medium hover:text-green-600 transition-colors">
                        {t("navbar.services")}
                    </Link>
                    <Link href="#contact" className="text-sm font-medium hover:text-green-600 transition-colors">
                        {t("navbar.contact")}
                    </Link>
                </nav>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700">
                                {t("navbar.login")}
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-md w-full">
                            <DialogTitle className="sr-only">
                                {t("auth.loginTitle")}
                            </DialogTitle>
                            <AuthForms />
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </header>

    )
}

export default NavbarWithoutLogin
