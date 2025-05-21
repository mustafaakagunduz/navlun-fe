"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
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
    }, [activeTab, isResetMode, clearError, error])

    // Check password matching
    useEffect(() => {
        if (signupData.confirmPassword) {
            setPasswordsMatch(signupData.password === signupData.confirmPassword)
        }
    }, [signupData.password, signupData.confirmPassword])

    // Form change handlers
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLoginData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field if exists
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

        // Clear error for this field if exists
        if (formErrors.signup[name]) {
            setFormErrors(prev => ({
                ...prev,
                signup: { ...prev.signup, [name]: "" }
            }))
        }
    }

    const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetEmail(e.target.value)

        // Clear error if exists
        if (formErrors.reset.email) {
            setFormErrors(prev => ({
                ...prev,
                reset: { ...prev.reset, email: "" }
            }))
        }
    }

    const handleRoleChange = (value: 'SENDER' | 'CARRIER' | 'BROKER') => {
        setSignupData(prev => ({ ...prev, role: value }))
    }

    // Form validations
    const validateLoginForm = () => {
        const errors: FormErrorsType = {}

        if (!loginData.email) {
            errors.email = t("auth.errors.emailRequired")
        } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
            errors.email = t("auth.errors.emailInvalid")
        }

        if (!loginData.password) {
            errors.password = t("auth.errors.passwordRequired")
        }

        setFormErrors(prev => ({ ...prev, login: errors }))
        return Object.keys(errors).length === 0
    }

    const validateSignupForm = () => {
        const errors: FormErrorsType = {}

        if (!signupData.firstName) {
            errors.firstName = t("auth.errors.firstNameRequired")
        }

        if (!signupData.lastName) {
            errors.lastName = t("auth.errors.lastNameRequired")
        }

        if (!signupData.email) {
            errors.email = t("auth.errors.emailRequired")
        } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
            errors.email = t("auth.errors.emailInvalid")
        }

        if (!signupData.password) {
            errors.password = t("auth.errors.passwordRequired")
        } else if (signupData.password.length < 8) {
            errors.password = t("auth.errors.passwordLength")
        }

        if (!signupData.confirmPassword) {
            errors.confirmPassword = t("auth.errors.confirmPasswordRequired")
        } else if (signupData.password !== signupData.confirmPassword) {
            errors.confirmPassword = t("auth.errors.passwordsNotMatch")
        }

        setFormErrors(prev => ({ ...prev, signup: errors }))
        return Object.keys(errors).length === 0
    }

    const validateResetForm = () => {
        const errors: FormErrorsType = {}

        if (!resetEmail) {
            errors.email = t("auth.errors.emailRequired")
        } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
            errors.email = t("auth.errors.emailInvalid")
        }

        setFormErrors(prev => ({ ...prev, reset: errors }))
        return Object.keys(errors).length === 0
    }

    // Form submissions
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateLoginForm()) return

        try {
            await login(loginData.email, loginData.password)
        } catch (error) {
            // Error handled in AuthContext
        }
    }

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateSignupForm()) return

        try {
            const { confirmPassword, ...signupDataToSend } = signupData
            const result = await signup(signupDataToSend)
            // Doğrulama sayfasına yönlendirilecek (AuthContext'te needsVerification true olacak)
        } catch (error) {
            // Error handled in AuthContext
        }
    }

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateResetForm()) return

        try {
            await authService.requestPasswordReset(resetEmail)
            setResetSuccess(true)
        } catch (error: any) {
            setFormErrors(prev => ({
                ...prev,
                reset: {
                    email: error.response?.data?.message || t("auth.errors.resetFailed")
                }
            }))
        }
    }

    // Mode toggles
    const toggleResetMode = () => {
        setIsResetMode(!isResetMode)
        setResetSuccess(false)
        clearError()
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value as "login" | "signup")
        clearError()
    }

    // E-posta doğrulama tamamlandı
    const handleVerificationSuccess = () => {
        completeEmailVerification()
    }

    // E-posta doğrulama iptal edildi
    const handleVerificationCancel = () => {
        cancelEmailVerification()
    }

    // Doğrulama ihtiyacı varsa doğrulama formunu göster
    if (needsVerification && verificationUserId && verificationEmail) {
        return (
            <div className="w-full max-w-md mx-auto">
                <EmailVerificationForm
                    userId={verificationUserId}
                    email={verificationEmail}
                    onVerificationSuccess={handleVerificationSuccess}
                    onCancel={handleVerificationCancel}
                    t={t}
                />
            </div>
        );
    }

    // Main render
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="transition-all duration-300 ease-in-out">
                {!isResetMode ? (
                    <Tabs
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="w-full"
                    >
                        <TabsList className="bg-gray-100 p-1.5 rounded-xl mb-6 gap-2 w-full">
                            <TabsTrigger
                                value="login"
                                className="rounded-lg py-3 px-6 transition-all data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 data-[state=active]:font-semibold flex-1"
                            >
                                {t("auth.login")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="rounded-lg py-3 px-6 transition-all data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 data-[state=active]:font-semibold flex-1"
                            >
                                {t("auth.signup")}
                            </TabsTrigger>
                        </TabsList>

                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

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
                ) : (
                    <Card className="border border-gray-200 shadow-xl rounded-xl bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-bold text-green-700">{t("auth.resetPassword")}</CardTitle>
                            <CardDescription>
                                {t("auth.resetPasswordDescription")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

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
                )}
            </div>
        </div>
    )
}

export default AuthForms