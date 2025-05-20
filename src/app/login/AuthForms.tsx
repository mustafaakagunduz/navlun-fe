"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Check,
    Loader2,
    X,
    AlertCircle,
    Mail,
    Lock,
    User,
    Phone,
    Shield,
    ArrowLeft
} from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useAuth } from "@/context/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import authService from "@/services/authService"

type SignupFormType = {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    role: 'SENDER' | 'CARRIER' | 'BROKER'
}

const AuthForms = () => {
    const { t } = useLanguage()
    const { login, signup, error, clearError, isLoading } = useAuth()

    // Form states
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
    const [isResetMode, setIsResetMode] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [passwordsMatch, setPasswordsMatch] = useState(true)

    // Form data
    const [loginData, setLoginData] = useState({ email: "", password: "" })
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
        login: {} as Record<string, string>,
        signup: {} as Record<string, string>,
        reset: {} as Record<string, string>
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



    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        // Doğrudan güncelleme yapalım, setTimeout kullanmadan
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
        // Doğrudan güncelleme yapalım
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
        const errors: Record<string, string> = {}

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
        const errors: Record<string, string> = {}

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
        const errors: Record<string, string> = {}

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
            await signup(signupDataToSend)
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

    // Style classes
    const inputContainerClass = "relative"
    const inputClass = "h-12 px-4 pl-10 rounded-lg border border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors shadow-sm w-full placeholder:text-gray-400"
    const inputErrorClass = "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200"
    const buttonClass = "h-12 rounded-lg font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all shadow-md hover:shadow-lg w-full"
    const labelClass = "font-medium text-gray-700 mb-1.5 block text-sm"
    const iconClass = "absolute left-3 top-3.5 h-5 w-5 text-gray-400"
    const errorClass = "text-sm text-red-500 mt-1 flex items-center"
    const errorIconClass = "h-3.5 w-3.5 mr-1"

    // Input with icon and error handling component
    // Find the FormInput component in your code (around line 225)
// and replace it with this fixed version:

    const FormInput = ({
                           id,
                           name,
                           type = "text",
                           placeholder,
                           value,
                           onChange,
                           icon,
                           label,
                           error,
                           rightIcon = null
                       }: {
        id: string
        name: string
        type?: string
        placeholder: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        icon: React.ReactNode
        label: string
        error?: string
        rightIcon?: React.ReactNode | null
    }) => (
        <div className="space-y-2">
            <Label htmlFor={id} className={labelClass}>{label}</Label>
            <div className={inputContainerClass}>
                {icon}
                <Input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`${inputClass} ${error ? inputErrorClass : ""}`}
                    autoComplete="on"
                    spellCheck="false"
                />
                {rightIcon && (
                    <div className="absolute right-3 top-3.5">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className={errorClass}>
                    <AlertCircle className={errorIconClass} />
                    {error}
                </p>
            )}
        </div>
    )

    // Render login form
    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="space-y-6">
            <FormInput
                id="login-email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={loginData.email}
                onChange={handleLoginChange}
                icon={<Mail className={iconClass} />}
                label={t("auth.email")}
                error={formErrors.login.email}
            />

            <div className="space-y-2">
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

                <div className={inputContainerClass}>
                    <Lock className={iconClass} />
                    <Input
                        id="login-password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={`${inputClass} ${formErrors.login.password ? inputErrorClass : ""}`}
                    />
                </div>

                {formErrors.login.password && (
                    <p className={errorClass}>
                        <AlertCircle className={errorIconClass} />
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
    )

    // Render signup form
    const renderSignupForm = () => (
        <form onSubmit={handleSignupSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label className={labelClass}>{t("auth.accountType")}</Label>
                <RadioGroup
                    defaultValue={signupData.role}
                    onValueChange={(value) => handleRoleChange(value as 'SENDER' | 'CARRIER' | 'BROKER')}
                    className="grid grid-cols-3 gap-3"
                >
                    {[
                        { value: 'SENDER', label: t("auth.sender") },
                        { value: 'CARRIER', label: t("auth.carrier") },
                        { value: 'BROKER', label: t("auth.broker") }
                    ].map(role => (
                        <div key={role.value} className="flex items-center gap-2 bg-white rounded-md p-3 shadow-sm border border-gray-200 hover:border-green-200 transition-colors">
                            <RadioGroupItem
                                value={role.value}
                                id={role.value.toLowerCase()}
                                className="text-green-600"
                            />
                            <Label
                                htmlFor={role.value.toLowerCase()}
                                className="cursor-pointer font-medium text-sm"
                            >
                                {role.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput
                    id="firstName"
                    name="firstName"
                    placeholder={t("auth.firstName")}
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    icon={<User className={iconClass} />}
                    label={t("auth.firstName")}
                    error={formErrors.signup.firstName}
                />

                <FormInput
                    id="lastName"
                    name="lastName"
                    placeholder={t("auth.lastName")}
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    icon={<User className={iconClass} />}
                    label={t("auth.lastName")}
                    error={formErrors.signup.lastName}
                />
            </div>

            <FormInput
                id="signup-email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={signupData.email}
                onChange={handleSignupChange}
                icon={<Mail className={iconClass} />}
                label={t("auth.email")}
                error={formErrors.signup.email}
            />

            <FormInput
                id="phone"
                name="phone"
                placeholder="+90 (___) ___ __ __"
                value={signupData.phone}
                onChange={handleSignupChange}
                icon={<Phone className={iconClass} />}
                label={t("auth.phone")}
            />

            <FormInput
                id="signup-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={signupData.password}
                onChange={handleSignupChange}
                icon={<Lock className={iconClass} />}
                label={t("auth.password")}
                error={formErrors.signup.password}
            />

            <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                icon={<Shield className={iconClass} />}
                label={t("auth.confirmPassword")}
                error={formErrors.signup.confirmPassword}
                rightIcon={
                    signupData.confirmPassword ? (
                        passwordsMatch ?
                            <Check className="h-5 w-5 text-green-500" /> :
                            <X className="h-5 w-5 text-red-500" />
                    ) : null
                }
            />

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
    )

    // Render password reset form
    const renderResetForm = () => (
        <>
            {resetSuccess ? (
                <div className="space-y-6">
                    <Alert className="bg-green-50 border-green-200 text-green-800 rounded-lg">
                        <Check className="h-5 w-5 text-green-600" />
                        <AlertDescription className="font-medium">
                            {t("auth.resetLinkSent")}
                        </AlertDescription>
                    </Alert>
                    <p className="text-gray-600 mt-4">
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
                <form onSubmit={handleResetSubmit} className="space-y-6">
                    <FormInput
                        id="reset-email"
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        value={resetEmail}
                        onChange={handleResetEmailChange}
                        icon={<Mail className={iconClass} />}
                        label={t("auth.email")}
                        error={formErrors.reset.email}
                    />

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
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("auth.backToLogin")}
                    </Button>
                </form>
            )}
        </>
    )

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
                                    {renderLoginForm()}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0">
                            <Card className="border border-gray-200 shadow-xl rounded-xl bg-white overflow-hidden">
                                <CardContent className="p-6 pt-6">
                                    {renderSignupForm()}
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

                            {renderResetForm()}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default AuthForms