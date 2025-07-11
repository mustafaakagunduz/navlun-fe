// src/app/login/EmailVerificationForm.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail, Clock, RefreshCw, CheckCircle, KeyRound } from "lucide-react"
import verificationService from "@/services/verificationService"
import { styleClasses } from "./styles"
import { useAuth } from "@/context/AuthContext"

type EmailVerificationFormProps = {
    userId: string
    email: string
    onVerificationSuccess: () => void
    onCancel: () => void
    t: (key: string) => string
}

const EmailVerificationForm = ({
                                   userId,
                                   email,
                                   onVerificationSuccess,
                                   onCancel,
                                   t
                               }: EmailVerificationFormProps) => {
    const [verificationCode, setVerificationCode] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    const [timeLeft, setTimeLeft] = useState<number>(300) // 5 dakika
    const [isResending, setIsResending] = useState<boolean>(false)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    // 6 adet input ref'i
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

    // Zamanlayıcı
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft])

    // İlk input'a focus
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    // 6 hane girildiğinde otomatik doğrulama
    useEffect(() => {
        if (verificationCode.length === 6 && !isLoading && !success && !isProcessing && !error) {
            handleAutoSubmit()
        }
    }, [verificationCode, isLoading, success, isProcessing, error]) // error'ı da dependency'ye ekledik

    // Süreyi biçimlendir
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
    }

    // Input değişiklik handler'ı
    const handleInputChange = (index: number, value: string) => {
        // Sadece sayı girişine izin ver
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = verificationCode.split('')
            newCode[index] = value
            const updatedCode = newCode.join('')
            setVerificationCode(updatedCode)

            // Hata varsa temizle
            if (error) {
                setError(null)
            }

            // Sonraki input'a geç
            if (value && index < 5 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1]?.focus()
            }
        }
    }

    // Keyboard event handler'ı
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!verificationCode[index] && index > 0) {
                inputRefs.current[index - 1]?.focus()
            }
        }
    }

    // Paste event handler'ı
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').trim()

        if (/^\d{6}$/.test(pastedData)) {
            setVerificationCode(pastedData)
            if (inputRefs.current[5]) {
                inputRefs.current[5].focus()
            }
        }
    }

    // Otomatik doğrulama
    const handleAutoSubmit = async () => {
        if (verificationCode.length !== 6 || isProcessing) {
            console.log('Skipping auto submit - code length:', verificationCode.length, 'isProcessing:', isProcessing)
            return
        }

        console.log('=== FRONTEND VERIFICATION START ===')
        console.log('Starting verification for userId:', userId, 'code:', verificationCode)

        setIsProcessing(true)
        setIsLoading(true)
        setError(null)

        try {
            const response = await verificationService.verifyEmail(userId, verificationCode)
            console.log('Verification response received:', response)

            if (response.success) {
                console.log('Email verification successful')
                setSuccess(true)

                // Token'lar varsa localStorage'a kaydet
                if (response.accessToken && response.refreshToken) {
                    console.log('Saving tokens to localStorage')
                    localStorage.setItem('accessToken', response.accessToken)
                    localStorage.setItem('refreshToken', response.refreshToken)

                    // Token'lar kaydedildikten sonra kısa bir süre bekle
                    setTimeout(() => {
                        console.log('Calling onVerificationSuccess callback')
                        onVerificationSuccess()
                    }, 1000) // 1.5 saniyeden 1 saniyeye düşürdük
                } else {
                    console.log('No tokens in response, using fallback method')
                    setTimeout(() => {
                        console.log('Calling onVerificationSuccess callback (fallback)')
                        onVerificationSuccess()
                    }, 1500)
                }
            } else {
                console.log('Email verification failed:', response.message)
                setError(response.message || t("auth.emailVerification.incorrectCode"))
                setIsLoading(false)
                setIsProcessing(false)
            }
            console.log('=== FRONTEND VERIFICATION END (SUCCESS) ===')
        } catch (error: any) {
            console.error('Verification error:', error)
            setError(error.response?.data?.message || t("auth.emailVerification.verificationFailed"))
            setIsLoading(false)
            setIsProcessing(false)
            console.log('=== FRONTEND VERIFICATION END (ERROR) ===')
        }
    }

    // Manuel form gönderimi
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isProcessing) {
            await handleAutoSubmit()
        }
    }

    // Yeni kod iste
    const handleResendCode = async () => {
        if (isResending || timeLeft > 0) return

        setIsResending(true)
        setError(null)

        try {
            console.log('Resending verification code for user:', userId)
            const response = await verificationService.resendVerificationCode(userId, email)

            if (response.success) {
                setTimeLeft(300) // 5 dakikayı sıfırla
                setVerificationCode("")

                // Input'ları temizle
                inputRefs.current.forEach(input => {
                    if (input) input.value = ""
                })

                // İlk input'a focus
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus()
                }
            } else {
                setError(response.message || t("auth.emailVerification.resendFailed"))
            }
        } catch (error: any) {
            console.error('Resend error:', error)
            setError(error.response?.data?.message || t("auth.emailVerification.resendFailed"))
        } finally {
            setIsResending(false)
        }
    }

    return (
        <Card className="border border-gray-200 shadow-xl rounded-xl bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 text-center">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-3">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                    {t("auth.emailVerification.title") || "E-posta Doğrulama"}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                    {t("auth.emailVerification.description") || `${email} adresine gönderilen 6 haneli kodu girin`}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-2">
                {success ? (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-700 mb-2">
                                {t("auth.emailVerification.success") || "Doğrulama Başarılı!"}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {t("auth.emailVerification.successMessage") || "E-posta adresiniz başarıyla doğrulandı. Giriş yapılıyor..."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: 6 }, (_, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={verificationCode[index] || ''}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200"
                                        disabled={isLoading || isProcessing}
                                        style={{
                                            WebkitBackfaceVisibility: 'hidden',
                                            backfaceVisibility: 'hidden',
                                            WebkitTransform: 'translate3d(0, 0, 0)',
                                            transform: 'translate3d(0, 0, 0)',
                                            willChange: 'auto'
                                        }}
                                    />
                                ))}
                            </div>

                            {timeLeft > 0 && (
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {t("emailVerification.timeLeft") || "Kalan süre "}: {formatTime(timeLeft)}
                                    </span>
                                </div>
                            )}

                            {error && (
                                <Alert className="bg-red-50 border-red-200 text-red-800">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                className={`${styleClasses.button} w-full`}
                                disabled={verificationCode.length !== 6 || isLoading || isProcessing}
                                style={{
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                    WebkitTransform: 'translate3d(0, 0, 0)',
                                    transform: 'translate3d(0, 0, 0)',
                                    willChange: 'auto'
                                }}
                            >
                                {isLoading || isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t("auth.emailVerification.verifying") || "Doğrulanıyor..."}
                                    </>
                                ) : (
                                    t("auth.emailVerification.verify") || "Doğrula"
                                )}
                            </button>

                            <div className="flex justify-between items-center pt-2">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-gray-500 hover:text-gray-700 text-sm p-0 h-auto"
                                    onClick={onCancel}
                                    disabled={isLoading || isProcessing}
                                >
                                    {t("auth.emailVerification.cancel") || "İptal"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-green-600 hover:text-green-700 text-sm p-0 h-auto flex items-center"
                                    onClick={handleResendCode}
                                    disabled={isResending || timeLeft > 0 || isProcessing}
                                >
                                    {isResending ? (
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-1 h-3 w-3" />
                                    )}
                                    {t("auth.emailVerification.resendCode") || "Kodu Yeniden Gönder"}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

export default EmailVerificationForm