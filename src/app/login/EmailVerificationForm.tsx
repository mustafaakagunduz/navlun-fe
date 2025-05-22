"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, Clock, RefreshCw, CheckCircle, KeyRound } from "lucide-react";
import verificationService from "@/services/verificationService";
import { styleClasses } from "./styles";
import { useAuth } from "@/context/AuthContext";

type EmailVerificationFormProps = {
    userId: string;
    email: string;
    onVerificationSuccess: () => void;
    onCancel: () => void;
    t: (key: string) => string;
};

const EmailVerificationForm = ({
                                   userId,
                                   email,
                                   onVerificationSuccess,
                                   onCancel,
                                   t
                               }: EmailVerificationFormProps) => {
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 dakika
    const [isResending, setIsResending] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false); // Çoklu istek önleme

    // 6 adet input ref'i
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

    // Zamanlayıcı
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // İlk input'a focus
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // 6 hane girildiğinde otomatik doğrulama - sadece bir kez çalışacak
    useEffect(() => {
        if (verificationCode.length === 6 && !isLoading && !success && !isProcessing) {
            handleAutoSubmit();
        }
    }, [verificationCode, isLoading, success, isProcessing]);

    // Süreyi biçimlendir
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Input değişiklik handler'ı
    const handleInputChange = (index: number, value: string) => {
        // Sadece sayı girişine izin ver
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = verificationCode.split('');
            newCode[index] = value;
            const updatedCode = newCode.join('');
            setVerificationCode(updatedCode);

            // Hata varsa temizle
            if (error) {
                setError(null);
            }

            // Sonraki input'a geç
            if (value && index < 5 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Keyboard event handler'ı
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!verificationCode[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    // Paste event handler'ı
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (/^\d{6}$/.test(pastedData)) {
            setVerificationCode(pastedData);
            if (inputRefs.current[5]) {
                inputRefs.current[5].focus();
            }
        }
    };

    // Otomatik doğrulama (6 hane girildiğinde)
    const handleAutoSubmit = async () => {
        if (verificationCode.length !== 6 || isProcessing) return;

        setIsProcessing(true);
        setIsLoading(true);
        setError(null);

        try {
            console.log('Verifying email with code:', verificationCode);
            const response = await verificationService.verifyEmail(userId, verificationCode);

            if (response.success) {
                console.log('Email verification successful');
                setSuccess(true);

                // Biraz bekle, sonra otomatik login yap
                setTimeout(() => {
                    onVerificationSuccess();
                }, 1500);
            } else {
                console.log('Email verification failed:', response.message);
                setError(response.message || t("auth.emailVerification.incorrectCode"));
                setIsLoading(false);
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            setError(error.response?.data?.message || t("auth.emailVerification.verificationFailed"));
            setIsLoading(false);
            setIsProcessing(false);
        }
    };

    // Manuel form gönderimi
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isProcessing) {
            await handleAutoSubmit();
        }
    };

    // Yeni kod iste
    const handleResendCode = async () => {
        if (isResending) return;

        setIsResending(true);
        setError(null);

        try {
            const response = await verificationService.resendVerificationCode(userId, email);

            if (response.success) {
                setTimeLeft(300);
                setVerificationCode('');
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            } else {
                setError(response.message || t("auth.emailVerification.resendFailed"));
            }
        } catch (error) {
            setError(t("auth.emailVerification.resendFailed"));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Card className="shadow-xl border border-gray-200 rounded-xl bg-white">
            <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                    <KeyRound className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-green-700">
                    {t("auth.emailVerification.title") || "E-posta Adresinizi Doğrulayın"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                    {t("auth.emailVerification.description") || "E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin."}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success ? (
                    <div className="text-center py-6">
                        <Alert className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="font-medium">
                                {t("auth.emailVerification.success") || "E-posta Başarıyla Doğrulandı!"}
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-green-700 mb-2">
                            {t("auth.emailVerification.successMessage") || "Giriş yapılıyor..."}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Dashboard'a yönlendiriliyorsunuz...
                        </p>

                        <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center text-gray-700">
                                    <Mail className="h-4 w-4 mr-2" />
                                    <span className="font-medium">{email}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-amber-500 mr-1" />
                                    <span className={`font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-amber-500'}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* 6 haneli kod input alanı */}
                            <div className="flex justify-center space-x-2 mb-6">
                                {Array(6).fill(0).map((_, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        value={verificationCode[index] || ''}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 transition-colors
                                            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'}
                                        `}
                                        maxLength={1}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="one-time-code"
                                        disabled={isLoading || success || timeLeft === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Button
                                type="submit"
                                className={`${styleClasses.button} h-12`}
                                disabled={isLoading || success || verificationCode.length !== 6 || timeLeft === 0 || isProcessing}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t("auth.emailVerification.verifying") || "Doğrulanıyor..."}
                                    </>
                                ) : (
                                    t("auth.emailVerification.verify") || "Doğrula"
                                )}
                            </Button>

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
    );
};

export default EmailVerificationForm;