"use client"

import { useEffect } from "react"
import { Leaf } from "lucide-react"
import Link from "next/link"
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Simple header with logo */}
            <header className="w-full py-4 bg-white shadow-sm">
                <div className="container mx-auto px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Leaf className="h-6 w-6 text-green-600" />
                        <span className="text-xl font-bold">EkoTaşıma</span>
                    </Link>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {t("auth.welcomeBack")}
                        </h1>
                        <p className="text-gray-600">
                            {t("auth.loginOrSignup")}
                        </p>
                    </div>

                    <AuthForms />
                </div>
            </main>

            {/* Simple footer */}
            <footer className="w-full py-4 text-center text-sm text-gray-600">
                <div className="container mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} EkoTaşıma. {t("footer.copyright")}</p>
                </div>
            </footer>
        </div>
    )
}

export default LoginPage