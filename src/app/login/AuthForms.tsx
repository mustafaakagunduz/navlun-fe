// src/app/login/AuthForms.tsx
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useAuth } from "@/context/AuthContext"
import authService from "@/services/authService"

// Import types
import { FormErrorsType, LoginFormType, SignupFormType } from "./types"

// Import components
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import ResetForm from "./ResetForm"
import EmailVerificationForm from "./EmailVerificationForm"

const AuthForms = () => {
    const { t } = useLanguage()
    const {
        login,
        signup,
        error,
        clearError,
        isLoading,
        needsVerification,
        verificationUserId,
        verificationEmail,
        completeEmailVerification,
        cancelEmailVerification
    } = useAuth()

    // Form states
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
    const [isResetMode, setIsResetMode] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [passwordsMatch, setPasswordsMatch] = useState(true)

    // Form data
    const [loginData, setLoginData] = useState<LoginFormType>({
        email: "",
        password: ""
    })

    const [resetEmail, setResetEmail] = useState("")

    const [signupData, setSignupData] = useState<SignupFormType>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "+90",
        role: 'SENDER'
    })

    // Error states
    const [formErrors, setFormErrors] = useState({
        login: {} as FormErrorsType,
        signup: {} as FormErrorsType,
        reset: {} as FormErrorsType
    })

    // Reset errors when switching tabs or modes
    useEffect(() => {
        if (error) clearError()
    }, [activeTab, isResetMode, clearError])

    // Clear errors when data changes
    useEffect(() => {
        setFormErrors(prev => ({ ...prev, login: {} }))
    }, [loginData])

    useEffect(() => {
        setFormErrors(prev => ({ ...prev, signup: {} }))
    }, [signupData])

    useEffect(() => {
        setFormErrors(prev => ({ ...prev, reset: {} }))
    }, [resetEmail])

    // Check password match
    useEffect(() => {
        if (signupData.confirmPassword) {
            setPasswordsMatch(signupData.password === signupData.confirmPassword)
        } else {
            setPasswordsMatch(true)
        }
    }, [signupData.password, signupData.confirmPassword])

    // Form handlers
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLoginData(prev => ({ ...prev, [name]: value }))
        if (formErrors.login[name]) {
            setFormErrors(prev => ({
                ...prev,
                login: { ...prev.login, [name]: "" }
            }))
        }
    }

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSignupData(prev => ({ ...prev, [name]: value }))
        if (formErrors.signup[name]) {
            setFormErrors(prev => ({
                ...prev,
                signup: { ...prev.signup, [name]: "" }
            }))
        }
    }

    const handleRoleChange = (value: 'SENDER' | 'CARRIER' | 'BROKER') => {
        setSignupData(prev => ({ ...prev, role: value }))
    }

    const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetEmail(e.target.value)
        if (formErrors.reset.email) {
            setFormErrors(prev => ({
                ...prev,
                reset: { ...prev.reset, email: "" }
            }))
        }
    }

    // Validation functions
    const validateEmail = (email: string): string => {
        if (!email) return t("auth.errors.emailRequired")
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return t("auth.errors.emailInvalid")
        return ""
    }

    const validatePassword = (password: string): string => {
        if (!password) return t("auth.errors.passwordRequired")
        if (password.length < 6) return t("auth.errors.passwordTooShort")
        return ""
    }

    const validateSignupForm = (): boolean => {
        const errors: FormErrorsType = {}

        // Required fields
        if (!signupData.firstName.trim()) errors.firstName = t("auth.errors.firstNameRequired")
        if (!signupData.lastName.trim()) errors.lastName = t("auth.errors.lastNameRequired")

        // Email validation
        const emailError = validateEmail(signupData.email)
        if (emailError) errors.email = emailError

        // Phone validation
        if (!signupData.phone || signupData.phone.trim() === "+90") {
            errors.phone = t("auth.errors.phoneRequired")
        }

        // Password validation
        const passwordError = validatePassword(signupData.password)
        if (passwordError) errors.password = passwordError

        // Confirm password
        if (!signupData.confirmPassword) {
            errors.confirmPassword = t("auth.errors.confirmPasswordRequired")
        } else if (signupData.password !== signupData.confirmPassword) {
            errors.confirmPassword = t("auth.errors.passwordMismatch")
        }

        setFormErrors(prev => ({ ...prev, signup: errors }))
        return Object.keys(errors).length === 0
    }

    const validateLoginForm = (): boolean => {
        const errors: FormErrorsType = {}

        const emailError = validateEmail(loginData.email)
        if (emailError) errors.email = emailError

        const passwordError = validatePassword(loginData.password)
        if (passwordError) errors.password = passwordError

        setFormErrors(prev => ({ ...prev, login: errors }))
        return Object.keys(errors).length === 0
    }

    const validateResetForm = (): boolean => {
        const errors: FormErrorsType = {}

        const emailError = validateEmail(resetEmail)
        if (emailError) errors.email = emailError

        setFormErrors(prev => ({ ...prev, reset: errors }))
        return Object.keys(errors).length === 0
    }

    // Submit handlers
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateLoginForm()) return

        try {
            await login(loginData.email, loginData.password)
        } catch (error: any) {
            console.error("Login error:", error)
        }
    }

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateSignupForm()) return

        try {
            await signup({
                firstName: signupData.firstName.trim(),
                lastName: signupData.lastName.trim(),
                email: signupData.email.trim(),
                password: signupData.password,
                phone: signupData.phone.trim(),
                role: signupData.role
            })
        } catch (error: any) {
            console.error("Signup error:", error)
        }
    }

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateResetForm()) return

        try {
            await authService.requestPasswordReset(resetEmail)
            setResetSuccess(true)
        } catch (error: any) {
            console.error("Reset error:", error)
            setFormErrors(prev => ({
                ...prev,
                reset: { email: error.response?.data?.message || t("auth.errors.resetFailed") }
            }))
        }
    }

    // Toggle functions
    const toggleResetMode = () => {
        setIsResetMode(!isResetMode)
        setResetSuccess(false)
        setResetEmail("")
        setFormErrors(prev => ({ ...prev, reset: {} }))
        if (error) clearError()
    }

    // handleVerificationSuccess fonksiyonunu güncelle
    const handleVerificationSuccess = async () => {
        console.log('=== VERIFICATION SUCCESS HANDLER ===')

        // Token'lar localStorage'da zaten var, oradan al
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userEmail = localStorage.getItem('userEmail')

        if (accessToken && refreshToken && userEmail) {
            // Token'lar varsa direkt login işlemini tamamla
            console.log('Auto-login with tokens from localStorage')
            await completeEmailVerification(accessToken, refreshToken, userEmail)
        } else {
            // Token yoksa normal verification completion
            console.log('Normal verification completion')
            await completeEmailVerification()
        }
    }
    const handleVerificationCancel = () => {
        cancelEmailVerification()
    }

    // If email verification is needed
    if (needsVerification && verificationUserId && verificationEmail) {
        return (
            <EmailVerificationForm
                userId={verificationUserId}
                email={verificationEmail}
                onVerificationSuccess={handleVerificationSuccess}
                onCancel={handleVerificationCancel}
                t={t}
            />
        )
    }

    // Reset password form
    if (isResetMode) {
        return (
            <Card className="border border-gray-200 shadow-xl rounded-xl bg-white overflow-hidden">
                <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        {t("auth.resetPassword")}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {t("auth.resetPasswordDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                    <ResetForm
                        resetEmail={resetEmail}
                        formErrors={formErrors.reset}
                        isLoading={isLoading}
                        resetSuccess={resetSuccess}
                        handleResetEmailChange={handleResetEmailChange}
                        handleResetSubmit={handleResetSubmit}
                        toggleResetMode={toggleResetMode}
                        t={t}
                    />
                </CardContent>
            </Card>
        )
    }

    // Main login/signup forms
    return (
        <div className="w-full space-y-4">
            {error && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1 h-12">
                    <TabsTrigger
                        value="login"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                    >
                        {t("auth.login")}
                    </TabsTrigger>
                    <TabsTrigger
                        value="signup"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                    >
                        {t("auth.signup")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                    <Card className="border border-gray-200 shadow-xl rounded-xl bg-white overflow-hidden">
                        <CardContent className="p-6 pt-6">
                            <LoginForm
                                loginData={loginData}
                                formErrors={formErrors.login}
                                isLoading={isLoading}
                                handleLoginChange={handleLoginChange}
                                handleLoginSubmit={handleLoginSubmit}
                                toggleResetMode={toggleResetMode}
                                t={t}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                    <Card className="border border-gray-200 shadow-xl rounded-xl bg-white overflow-hidden">
                        <CardContent className="p-6 pt-6">
                            <SignupForm
                                signupData={signupData}
                                formErrors={formErrors.signup}
                                isLoading={isLoading}
                                passwordsMatch={passwordsMatch}
                                handleSignupChange={handleSignupChange}
                                handleRoleChange={handleRoleChange}
                                handleSignupSubmit={handleSignupSubmit}
                                t={t}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AuthForms