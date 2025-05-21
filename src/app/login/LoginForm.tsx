// /components/auth/forms/LoginForm.tsx
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
                <Label htmlFor="login-password" className={styleClasses.label}>{t("auth.password")}</Label>
                <Button
                    type="button"
                    variant="link"
                    className="px-0 text-green-600 font-normal h-auto"
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

        <Button
            type="submit"
            className={`${styleClasses.button} mt-8`}
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

export default LoginForm