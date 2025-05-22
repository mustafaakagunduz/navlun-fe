"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Check,
    Loader2,
    X,
    User,
    Mail,
    Phone,
    Lock,
    Shield
} from "lucide-react"
import { SignupFormProps } from "./types"
import { styleClasses } from "./styles"
import FormInput from "./FormInput"

const SignupForm = ({
                        signupData,
                        formErrors,
                        isLoading,
                        passwordsMatch,
                        handleSignupChange,
                        handleRoleChange,
                        handleSignupSubmit,
                        t
                    }: SignupFormProps) => (
    <form onSubmit={handleSignupSubmit} className="space-y-6">
        <div className="space-y-2">
            <Label className={styleClasses.label}>{t("auth.accountType") || "Hesap Türü"}</Label>
            <RadioGroup
                defaultValue={signupData.role}
                onValueChange={(value) => handleRoleChange(value as 'SENDER' | 'CARRIER' | 'BROKER')}
                className="grid grid-cols-3 gap-3"
            >
                {[
                    { value: 'SENDER', label: t("auth.sender") || "Gönderici" },
                    { value: 'CARRIER', label: t("auth.carrier") || "Taşıyıcı" },
                    { value: 'BROKER', label: t("auth.broker") || "Aracı" }
                ].map(role => (
                    <div key={role.value} className="flex items-center gap-2 bg-white rounded-md p-3 shadow-sm border border-gray-200 hover:border-green-200 transition-colors duration-200">
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
                placeholder={t("auth.firstName") || "Ad"}
                value={signupData.firstName}
                onChange={handleSignupChange}
                icon={<User className={styleClasses.icon} />}
                label={t("auth.firstName") || "Ad"}
                error={formErrors.firstName}
            />

            <FormInput
                id="lastName"
                name="lastName"
                placeholder={t("auth.lastName") || "Soyad"}
                value={signupData.lastName}
                onChange={handleSignupChange}
                icon={<User className={styleClasses.icon} />}
                label={t("auth.lastName") || "Soyad"}
                error={formErrors.lastName}
            />
        </div>

        <FormInput
            id="signup-email"
            name="email"
            type="email"
            placeholder="user@example.com"
            value={signupData.email}
            onChange={handleSignupChange}
            icon={<Mail className={styleClasses.icon} />}
            label={t("auth.email") || "E-posta"}
            error={formErrors.email}
        />

        <FormInput
            id="phone"
            name="phone"
            placeholder="+90 (___) ___ __ __"
            value={signupData.phone}
            onChange={handleSignupChange}
            icon={<Phone className={styleClasses.icon} />}
            label={t("auth.phone") || "Telefon"}
        />

        <FormInput
            id="signup-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={signupData.password}
            onChange={handleSignupChange}
            icon={<Lock className={styleClasses.icon} />}
            label={t("auth.password") || "Şifre"}
            error={formErrors.password}
        />

        <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={signupData.confirmPassword}
            onChange={handleSignupChange}
            icon={<Shield className={styleClasses.icon} />}
            label={t("auth.confirmPassword") || "Şifre Doğrulama"}
            error={formErrors.confirmPassword}
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
            className={`${styleClasses.button} mt-8 transform-none hover:transform-none active:transform-none focus:transform-none`}
            disabled={isLoading}
            style={{
                willChange: 'auto',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
            }}
        >
            <span className="flex items-center justify-center w-full">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("auth.signingUp") || "Kayıt olunuyor..."}
                    </>
                ) : (
                    t("auth.signup") || "Kayıt Ol"
                )}
            </span>
        </Button>
    </form>
)

export default SignupForm