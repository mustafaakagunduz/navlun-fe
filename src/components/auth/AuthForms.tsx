// components/auth/AuthForms.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Loader2, X, AlertCircle } from "lucide-react"
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
    role: 'SENDER' | 'CARRIER'
}

const AuthForms = () => {
    const { t } = useLanguage()
    const { login, signup, error, clearError, isLoading } = useAuth()

    // Login form state
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    })

    // Signup form state
    const [signupData, setSignupData] = useState<SignupFormType>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
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

        // Clear field error when typing
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

        // Clear field error when typing
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

    // Handle role selection change
    const handleRoleChange = (value: 'SENDER' | 'CARRIER') => {
        setSignupData({ ...signupData, role: value })
    }

    // Handle reset email change
    const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetEmail(e.target.value)

        // Clear field error when typing
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

    // Validate login form
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

    // Validate signup form
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

    // Validate reset form
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

    // Handle login submit
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

    // Handle signup submit
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

    // Handle reset password submit
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

    return (
        <div className="w-full max-w-md mx-auto">
            {!isResetMode ? (
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                        <TabsTrigger value="login" onClick={() => clearError()}>
                            {t("auth.login")}
                        </TabsTrigger>
                        <TabsTrigger value="signup" onClick={() => clearError()}>
                            {t("auth.signup")}
                        </TabsTrigger>
                    </TabsList>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <TabsContent value="login">
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">{t("auth.email")}</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            name="email"
                                            placeholder="user@example.com"
                                            value={loginData.email}
                                            onChange={handleLoginChange}
                                            className={formErrors.login.email ? "border-red-500" : ""}
                                        />
                                        {formErrors.login.email && (
                                            <p className="text-sm text-red-500">{formErrors.login.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="login-password">{t("auth.password")}</Label>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="px-0 text-green-600"
                                                onClick={toggleResetMode}
                                            >
                                                {t("auth.forgotPassword")}
                                            </Button>
                                        </div>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={loginData.password}
                                            onChange={handleLoginChange}
                                            className={formErrors.login.password ? "border-red-500" : ""}
                                        />
                                        {formErrors.login.password && (
                                            <p className="text-sm text-red-500">{formErrors.login.password}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSignupSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t("auth.accountType")}</Label>
                                        <RadioGroup
                                            defaultValue={signupData.role}
                                            onValueChange={(value) => handleRoleChange(value as 'SENDER' | 'CARRIER')}
                                            className="flex space-x-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="SENDER" id="sender" />
                                                <Label htmlFor="sender" className="cursor-pointer">
                                                    {t("auth.sender")}
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="CARRIER" id="carrier" />
                                                <Label htmlFor="carrier" className="cursor-pointer">
                                                    {t("auth.carrier")}
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                placeholder={t("auth.firstName")}
                                                value={signupData.firstName}
                                                onChange={handleSignupChange}
                                                className={formErrors.signup.firstName ? "border-red-500" : ""}
                                            />
                                            {formErrors.signup.firstName && (
                                                <p className="text-sm text-red-500">{formErrors.signup.firstName}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                placeholder={t("auth.lastName")}
                                                value={signupData.lastName}
                                                onChange={handleSignupChange}
                                                className={formErrors.signup.lastName ? "border-red-500" : ""}
                                            />
                                            {formErrors.signup.lastName && (
                                                <p className="text-sm text-red-500">{formErrors.signup.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">{t("auth.email")}</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            name="email"
                                            placeholder="user@example.com"
                                            value={signupData.email}
                                            onChange={handleSignupChange}
                                            className={formErrors.signup.email ? "border-red-500" : ""}
                                        />
                                        {formErrors.signup.email && (
                                            <p className="text-sm text-red-500">{formErrors.signup.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t("auth.phone")}</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder="+90 (___) ___ __ __"
                                            value={signupData.phone}
                                            onChange={handleSignupChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">{t("auth.password")}</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={signupData.password}
                                            onChange={handleSignupChange}
                                            className={formErrors.signup.password ? "border-red-500" : ""}
                                        />
                                        {formErrors.signup.password && (
                                            <p className="text-sm text-red-500">{formErrors.signup.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="••••••••"
                                                value={signupData.confirmPassword}
                                                onChange={handleSignupChange}
                                                className={formErrors.signup.confirmPassword ? "border-red-500" : ""}
                                            />
                                            {signupData.confirmPassword && (
                                                <div className="absolute right-3 top-3">
                                                    {passwordsMatch ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.signup.confirmPassword && (
                                            <p className="text-sm text-red-500">{formErrors.signup.confirmPassword}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-bold mb-4">{t("auth.resetPassword")}</h2>

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {resetSuccess ? (
                            <div className="space-y-4">
                                <Alert className="bg-green-50 border-green-500 mb-4">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <AlertDescription>
                                        {t("auth.resetLinkSent")}
                                    </AlertDescription>
                                </Alert>
                                <p className="text-sm text-gray-600">
                                    {t("auth.resetInstructions")}
                                </p>
                                <Button
                                    type="button"
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                    onClick={toggleResetMode}
                                >
                                    {t("auth.backToLogin")}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">{t("auth.email")}</Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={resetEmail}
                                        onChange={handleResetEmailChange}
                                        className={formErrors.reset.email ? "border-red-500" : ""}
                                    />
                                    {formErrors.reset.email && (
                                        <p className="text-sm text-red-500">{formErrors.reset.email}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("auth.processing")}
                                        </>
                                    ) : (
                                        t("auth.sendResetLink")
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
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
    )
}

export default AuthForms