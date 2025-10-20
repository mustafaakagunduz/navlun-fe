// src/app/login/LoginForm.tsx
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react"
import { LoginFormProps } from "./types"
import { styleClasses } from "./styles"
import FormInput from "./FormInput"

const LoginForm = ({
                       loginData,
                       formErrors,
                       isLoading,
                       handleLoginChange,
                       handleLoginSubmit,
                       toggleResetMode,
                       t
                   }: LoginFormProps) => (
    <form onSubmit={handleLoginSubmit} className="space-y-6">
        <FormInput
            id="login-email"
            name="email"
            type="email"
            placeholder="user@example.com"
            value={loginData.email}
            onChange={handleLoginChange}
            icon={<Mail className={styleClasses.icon} />}
            label={t("auth.email")}
            error={formErrors.email}
        />

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="login-password" className={styleClasses.label}>
                    {t("auth.password")}
                </Label>
                <Button
                    type="button"
                    variant="link"
                    className="px-0 text-green-600 font-normal h-auto hover:text-green-700 transition-colors duration-200"
                    onClick={toggleResetMode}
                >
                    {t("auth.forgotPassword")}
                </Button>
            </div>

            <div className={styleClasses.inputContainer}>
                <Lock className={styleClasses.icon} />
                <Input
                    id="login-password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={`${styleClasses.input} ${formErrors.password ? styleClasses.inputError : ""}`}
                />
            </div>

            {formErrors.password && (
                <p className={styleClasses.error}>
                    <AlertCircle className={styleClasses.errorIcon} />
                    {formErrors.password}
                </p>
            )}
        </div>

        <button
            type="submit"
            className={`${styleClasses.button} mt-8`}
            disabled={isLoading}
            style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                WebkitTransform: 'translate3d(0, 0, 0)',
                transform: 'translate3d(0, 0, 0)',
                willChange: 'auto'
            }}
        >
            <span className="flex items-center justify-center w-full">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("auth.loggingIn")}
                    </>
                ) : (
                    t("auth.login")
                )}
            </span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t("auth.orContinueWith") || "veya devam edin"}</span>
            </div>
        </div>

        {/* Social Login Buttonss */}
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
                    window.location.href = `${backendUrl}/oauth2/authorization/google`
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-gray-700 font-medium">Google ile giriş yap</span>
            </button>

            <button
                type="button"
                onClick={() => {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
                    window.location.href = `${backendUrl}/oauth2/authorization/facebook`
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                <span className="text-gray-700 font-medium">Facebook ile giriş yap</span>
            </button>
        </div>
    </form>
)

export default LoginForm