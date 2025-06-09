"use client"

import { useEffect } from "react"
import { Leaf } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AuthForms from "./AuthForms"
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-gray-100">
            {/* Modern header with logo */}
            <header className="w-full py-5 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                            <Leaf className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">
                            Transyük
                        </span>
                    </Link>

                    {/* Language switcher could go here */}
                </div>
            </header>

            {/* Main content without animations */}
            <main className="flex-1 flex flex-col md:flex-row items-stretch">
                {/* Left side with content and form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8 md:mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {t("auth.welcomeBack")}
                            </h1>
                            <p className="text-gray-600">
                                {t("auth.loginOrSignup")}
                            </p>
                        </div>

                        <AuthForms />
                    </div>
                </div>

                {/* Right side with illustration or image - simplified without animations */}
                <div className="hidden md:flex md:w-1/2 bg-green-50 relative overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="max-w-lg p-8 text-center">
                            <div className="mb-8 flex justify-center">
                                <div className="rounded-full bg-white p-6 shadow-lg">
                                    <Leaf className="h-20 w-20 text-green-500" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-green-800 mb-4">
                                {t("auth.ecoFriendlyTransport")}
                            </h2>
                            <p className="text-green-700">
                                {t("auth.platformDescription")}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Enhanced footer */}
            <footer className="w-full py-6 border-t border-gray-200 bg-white">
                <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-600">
                        &copy; {new Date().getFullYear()} Transyük. {t("footer.copyright")}
                    </p>

                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/terms" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            {t("footer.terms")}
                        </Link>
                        <Link href="/privacy" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            {t("footer.privacy")}
                        </Link>
                        <Link href="/contact" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            {t("footer.contact")}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LoginPage