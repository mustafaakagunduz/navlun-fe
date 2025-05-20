"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Loader2, X, AlertCircle, Mail, Lock, User, Phone, Shield } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useAuth } from "@/context/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import authService from "@/services/authService"

type SignupFormType = {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    role: 'SENDER' | 'CARRIER' | 'BROKER' // BROKER rolü eklendi
}

const AuthForms = () => {
    const { t } = useLanguage()
    const { login, signup, error, clearError, isLoading } = useAuth()

    // Login form state
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    })

    // Signup form state - BROKER rolü için varsayılan değer güncellemesi
    const [signupData, setSignupData] = useState<SignupFormType>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "+90 (___) ___ __ __",
        role: 'SENDER'
    })

    // Password reset state
    const [isResetMode, setIsResetMode] = useState(false)
    const [resetEmail, setResetEmail] = useState("")
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [resetSuccess, setResetSuccess] = useState(false)

    // Form validation error states
    const [formErrors, setFormErrors] = useState<{
        login: { [key: string]: string }
        signup: { [key: string]: string }
        reset: { [key: string]: string }
    }>({
        login: {},
        signup: {},
        reset: {}
    })

    // Clear API errors when tab changes
    useEffect(() => {
        if (error) {
            clearError()
        }
    }, [isResetMode, clearError, error])

    // Check password matching
    useEffect(() => {
        if (signupData.confirmPassword) {
            setPasswordsMatch(signupData.password === signupData.confirmPassword)
        }
    }, [signupData.password, signupData.confirmPassword])

    // Handle login form change
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLoginData({ ...loginData, [name]: value })

        if (formErrors.login[name]) {
            setFormErrors({
                ...formErrors,
                login: {
                    ...formErrors.login,
                    [name]: ""
                }
            })
        }
    }

    // Handle signup form change
    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSignupData({ ...signupData, [name]: value })

        if (formErrors.signup[name]) {
            setFormErrors({
                ...formErrors,
                signup: {
                    ...formErrors.signup,
                    [name]: ""
                }
            })
        }
    }

    // Handle role selection change - BROKER rolü için güncellendi
    const handleRoleChange = (value: 'SENDER' | 'CARRIER' | 'BROKER') => {
        setSignupData({ ...signupData, role: value })
    }

    // Handle reset email change
    const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetEmail(e.target.value)

        if (formErrors.reset.email) {
            setFormErrors({
                ...formErrors,
                reset: {
                    ...formErrors.reset,
                    email: ""
                }
            })
        }
    }

    // Form validation logic
    const validateLoginForm = () => {
        const errors: { [key: string]: string } = {}

        if (!loginData.email) {
            errors.email = t("auth.errors.emailRequired")
        } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
            errors.email = t("auth.errors.emailInvalid")
        }

        if (!loginData.password) {
            errors.password = t("auth.errors.passwordRequired")
        }

        setFormErrors({
            ...formErrors,
            login: errors
        })

        return Object.keys(errors).length === 0
    }

    const validateSignupForm = () => {
        const errors: { [key: string]: string } = {}

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

        setFormErrors({
            ...formErrors,
            signup: errors
        })

        return Object.keys(errors).length === 0
    }

    const validateResetForm = () => {
        const errors: { [key: string]: string } = {}

        if (!resetEmail) {
            errors.email = t("auth.errors.emailRequired")
        } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
            errors.email = t("auth.errors.emailInvalid")
        }

        setFormErrors({
            ...formErrors,
            reset: errors
        })

        return Object.keys(errors).length === 0
    }

    // Form submit handlers
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateLoginForm()) {
            return
        }

        try {
            await login(loginData.email, loginData.password)
        } catch (error) {
            // Error is already handled in AuthContext
        }
    }

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateSignupForm()) {
            return
        }

        // Destructure and omit confirmPassword from data sent to API
        const { confirmPassword, ...signupDataToSend } = signupData

        try {
            await signup(signupDataToSend)
        } catch (error) {
            // Error is already handled in AuthContext
        }
    }

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateResetForm()) {
            return
        }

        try {
            await authService.requestPasswordReset(resetEmail)
            setResetSuccess(true)
        } catch (error: any) {
            setFormErrors({
                ...formErrors,
                reset: {
                    email: error.response?.data?.message || t("auth.errors.resetFailed")
                }
            })
        }
    }

    // Toggle between login and reset password forms
    const toggleResetMode = () => {
        setIsResetMode(!isResetMode)
        setResetSuccess(false)
        clearError()
    }

    // Custom styles with improved UI
    const inputClass = "h-12 px-4 pl-10 rounded-lg border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
    const buttonClass = "h-12 rounded-lg font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 w-full"
    const tabClass = "rounded-lg font-medium py-3 px-5 transition-all data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 data-[state=active]:font-semibold"
    const tabListClass = "bg-gray-100 p-1.5 rounded-xl mb-8 gap-2"
    const labelClass = "font-medium text-gray-700 mb-1.5 block text-sm tracking-wide"

    return (
        <div className="w-full max-w-md mx-auto perspective">
            <div className={`transform transition-all duration-500 ${isResetMode ? 'rotate-y-180' : ''}`}>
                {!isResetMode ? (
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className={tabListClass}>
                            <TabsTrigger value="login" onClick={() => clearError()} className={tabClass}>
                                {t("auth.login")}
                            </TabsTrigger>
                            <TabsTrigger value="signup" onClick={() => clearError()} className={tabClass}>
                                {t("auth.signup")}
                            </TabsTrigger>
                        </TabsList>

                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <TabsContent value="login">
                            <Card className="border-0 shadow-lg overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50">
                                <CardContent className="p-8">
                                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="login-email" className={labelClass}>{t("auth.email")}</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="login-email"
                                                    type="email"
                                                    name="email"
                                                    placeholder="user@example.com"
                                                    value={loginData.email}
                                                    onChange={handleLoginChange}
                                                    className={`${inputClass} ${formErrors.login.email ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                />
                                            </div>
                                            {formErrors.login.email && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                    {formErrors.login.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="login-password" className={labelClass}>{t("auth.password")}</Label>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="px-0 text-green-600 font-normal h-auto"
                                                    onClick={toggleResetMode}
                                                >
                                                    {t("auth.forgotPassword")}
                                                </Button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="login-password"
                                                    type="password"
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    className={`${inputClass} ${formErrors.login.password ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                />
                                            </div>
                                            {formErrors.login.password && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                    {formErrors.login.password}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            className={`${buttonClass} mt-8`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {t("auth.loggingIn")}
                                                </>
                                            ) : (
                                                t("auth.login")
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="signup">
                            <Card className="border-0 shadow-lg overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50">
                                <CardContent className="p-8">
                                    <form onSubmit={handleSignupSubmit} className="space-y-5">
                                        <div className="space-y-2.5">
                                            <Label className={labelClass}>{t("auth.accountType")}</Label>
                                            <RadioGroup
                                                defaultValue={signupData.role}
                                                onValueChange={(value) => handleRoleChange(value as 'SENDER' | 'CARRIER' | 'BROKER')}
                                                className="flex space-x-3 bg-gray-50 p-3 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-2 flex-1 bg-white rounded-md p-2 shadow-sm border border-gray-100">
                                                    <RadioGroupItem value="SENDER" id="sender" />
                                                    <Label htmlFor="sender" className="cursor-pointer font-medium">
                                                        {t("auth.sender")}
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-1 bg-white rounded-md p-2 shadow-sm border border-gray-100">
                                                    <RadioGroupItem value="CARRIER" id="carrier" />
                                                    <Label htmlFor="carrier" className="cursor-pointer font-medium">
                                                        {t("auth.carrier")}
                                                    </Label>
                                                </div>
                                                {/* Yeni eklenen broker seçeneği */}
                                                <div className="flex items-center space-x-2 flex-1 bg-white rounded-md p-2 shadow-sm border border-gray-100">
                                                    <RadioGroupItem value="BROKER" id="broker" />
                                                    <Label htmlFor="broker" className="cursor-pointer font-medium">
                                                        {t("auth.broker")}
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2.5">
                                                <Label htmlFor="firstName" className={labelClass}>{t("auth.firstName")}</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        id="firstName"
                                                        name="firstName"
                                                        placeholder={t("auth.firstName")}
                                                        value={signupData.firstName}
                                                        onChange={handleSignupChange}
                                                        className={`${inputClass} ${formErrors.signup.firstName ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                    />
                                                </div>
                                                {formErrors.signup.firstName && (
                                                    <p className="text-sm text-red-500 mt-1 flex items-center">
                                                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                        {formErrors.signup.firstName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label htmlFor="lastName" className={labelClass}>{t("auth.lastName")}</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        id="lastName"
                                                        name="lastName"
                                                        placeholder={t("auth.lastName")}
                                                        value={signupData.lastName}
                                                        onChange={handleSignupChange}
                                                        className={`${inputClass} ${formErrors.signup.lastName ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                    />
                                                </div>
                                                {formErrors.signup.lastName && (
                                                    <p className="text-sm text-red-500 mt-1 flex items-center">
                                                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                        {formErrors.signup.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="signup-email" className={labelClass}>{t("auth.email")}</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="signup-email"
                                                    type="email"
                                                    name="email"
                                                    placeholder="user@example.com"
                                                    value={signupData.email}
                                                    onChange={handleSignupChange}
                                                    className={`${inputClass} ${formErrors.signup.email ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                />
                                            </div>
                                            {formErrors.signup.email && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                    {formErrors.signup.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="phone" className={labelClass}>{t("auth.phone")}</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    placeholder="+90 (___) ___ __ __"
                                                    value={signupData.phone}
                                                    onChange={handleSignupChange}
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="signup-password" className={labelClass}>{t("auth.password")}</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={signupData.password}
                                                    onChange={handleSignupChange}
                                                    className={`${inputClass} ${formErrors.signup.password ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                />
                                            </div>
                                            {formErrors.signup.password && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                    {formErrors.signup.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="confirmPassword" className={labelClass}>{t("auth.confirmPassword")}</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="••••••••"
                                                    value={signupData.confirmPassword}
                                                    onChange={handleSignupChange}
                                                    className={`${inputClass} ${formErrors.signup.confirmPassword ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                                />
                                                {signupData.confirmPassword && (
                                                    <div className="absolute right-3 top-3.5">
                                                        {passwordsMatch ? (
                                                            <Check className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-red-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {formErrors.signup.confirmPassword && (
                                                <p className="text-sm text-red-500 mt-1 flex items-center">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                    {formErrors.signup.confirmPassword}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            className={`${buttonClass} mt-8`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {t("auth.signingUp")}
                                                </>
                                            ) : (
                                                t("auth.signup")
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <Card className="border-0 shadow-lg overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-6 text-green-700">{t("auth.resetPassword")}</h2>

                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {resetSuccess ? (
                                <div className="space-y-6">
                                    <Alert className="bg-green-50 border-green-200 text-green-800 mb-6 rounded-lg">
                                        <Check className="h-5 w-5 text-green-600" />
                                        <AlertDescription className="font-medium">
                                            {t("auth.resetLinkSent")}
                                        </AlertDescription>
                                    </Alert>
                                    <p className="text-gray-600">
                                        {t("auth.resetInstructions")}
                                    </p>
                                    <Button
                                        type="button"
                                        className={buttonClass}
                                        onClick={toggleResetMode}
                                    >
                                        {t("auth.backToLogin")}
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleResetSubmit} className="space-y-5">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="reset-email" className={labelClass}>{t("auth.email")}</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="reset-email"
                                                type="email"
                                                placeholder="user@example.com"
                                                value={resetEmail}
                                                onChange={handleResetEmailChange}
                                                className={`${inputClass} ${formErrors.reset.email ? "border-red-300 bg-red-50 text-red-900" : ""}`}
                                            />
                                        </div>
                                        {formErrors.reset.email && (
                                            <p className="text-sm text-red-500 mt-1 flex items-center">
                                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                {formErrors.reset.email}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className={`${buttonClass} mt-8`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t("auth.processing")}
                                            </>
                                        ) : (
                                            t("auth.sendResetLink")
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 rounded-lg font-medium border-gray-300 hover:bg-gray-50 mt-4 transition-all shadow-sm"
                                        onClick={toggleResetMode}
                                    >
                                        {t("auth.backToLogin")}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default AuthForms