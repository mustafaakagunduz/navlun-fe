// /components/auth/forms/ResetForm.tsx
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Loader2, ArrowLeft, Mail } from "lucide-react"
import { ResetFormProps } from "./types"
import { styleClasses } from "./styles"
import FormInput from "./FormInput"

const ResetForm = ({
                       resetEmail,
                       formErrors,
                       isLoading,
                       resetSuccess,
                       handleResetEmailChange,
                       handleResetSubmit,
                       toggleResetMode,
                       t
                   }: ResetFormProps) => (
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
                    className={styleClasses.button}
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
                    icon={<Mail className={styleClasses.icon} />}
                    label={t("auth.email")}
                    error={formErrors.email}
                />

                <Button
                    type="submit"
                    className={`${styleClasses.button} mt-8`}
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

export default ResetForm