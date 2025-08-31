// src/app/login/page.tsx
"use client"

import { useEffect } from "react"
import { Leaf, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AuthForms from "./AuthForms"
import LanguageSwitcher from "@/components/homepage/LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

const LoginPage = () => {
    const { t } = useLanguage()
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, router])

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background Image */}
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
            
            <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header - Same as main page */}
            <header className="sticky top-0 z-40 w-full bg-transparent">
                <div className="flex h-16 items-center justify-between px-3 sm:px-4 w-full">
                    <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                        <Image
                            src="/assets/images/transyuk-aka.png"
                            alt="TRANSYÜK Logo"
                            width={120}
                            height={32}
                            className="h-8 w-auto"
                        />
                    </Link>
                    <nav className="hidden lg:flex gap-6">
                        <Link href="/#hero" className="text-base font-semibold transition-colors text-white hover:text-green-400">
                            Ana Sayfa
                        </Link>
                        <Link href="/#about" className="text-base font-semibold transition-colors text-white hover:text-green-400">
                            Hakkımızda
                        </Link>
                        <Link href="/#services" className="text-base font-semibold transition-colors text-white hover:text-green-400">
                            Hizmetlerimiz
                        </Link>
                        <Link href="/#contact" className="text-base font-semibold transition-colors text-white hover:text-green-400">
                            İletişim
                        </Link>
                        <Link href="/#blog" className="text-base font-semibold transition-colors text-white hover:text-green-400">
                            Blog
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-2">
                            <LanguageSwitcher />
                        </div>
                        
                        <button
                            className="lg:hidden p-2"
                            aria-label="Toggle mobile menu"
                        >
                            <Menu className="h-6 w-6 text-white" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content - Centered form */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 md:mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                            {t("auth.welcomeBack")}
                        </h1>
                        <p className="text-lg text-gray-200/90 font-medium drop-shadow-md">
                            {t("auth.loginOrSignup")}
                        </p>
                    </div>

                    <AuthForms />
                </div>
            </main>
            </div>
        </div>
    )
}

export default LoginPage