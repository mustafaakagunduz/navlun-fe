"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail, Clock, RefreshCw, CheckCircle } from "lucide-react"
import verificationService from "@/services/verificationService"
import { styleClasses } from "./styles"

type EmailVerificationFormProps = {
    userId: string;
    email: string;
    onVerificationSuccess: () => void;
    onCancel: () => void;
    t: (key: string) => string;
}

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
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 dakika (300 saniye)
    const [isResending, setIsResending] = useState<boolean>(false);
    const router = useRouter();
    const { login } = useAuth();

    // Zamanlayıcı
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Süreyi biçimlendir (dakika:saniye)
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Doğrulama kodunu gönder
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!verificationCode) {
            setError("Lütfen doğrulama kodunu girin.");
            return;
        }

        if (verificationCode.length !== 6) {
            setError("Doğrulama kodu 6 haneli olmalıdır.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await verificationService.verifyEmail(userId, verificationCode);

            if (response.success) {
                setSuccess(true);
                // Doğrulama başarılı - giriş yap ve anasayfaya yönlendir
                setTimeout(() => {
                    onVerificationSuccess();
                }, 1500);
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            setError("Doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    // Yeni kod iste
    const handleResendCode = async () => {
        setIsResending(true);
        setError(null);

        try {
            const response = await verificationService.resendVerificationCode(userId, email);

            if (response.success) {
                // Süreyi yeniden başlat
                setTimeLeft(300);
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError("Yeni kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Card className="shadow-xl border border-gray-200 rounded-xl bg-white">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-700">
                    {t("auth.emailVerification.title")}
                </CardTitle>
                <CardDescription>
                    {t("auth.emailVerification.description")}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success ? (
                    <div className="text-center py-6">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-green-700 mb-2">
                            {t("auth.emailVerification.success")}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {t("auth.emailVerification.successMessage")}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm font-medium text-gray-700">{email}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                                    <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-amber-500'}`}>
                    {formatTime(timeLeft)}
                  </span>
                                </div>
                            </div>

                            <Input
                                type="text"
                                maxLength={6}
                                placeholder="6 haneli kodu girin"
                                className={`h-14 text-center text-2xl tracking-widest font-mono ${timeLeft === 0 ? 'border-red-300' : ''}`}
                                value={verificationCode}
                                onChange={(e) => {
                                    // Sadece rakam girişine izin ver
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setVerificationCode(value);
                                }}
                                disabled={isLoading || success || timeLeft === 0}
                            />
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Button
                                type="submit"
                                className={`${styleClasses.button} h-12`}
                                disabled={isLoading || success || verificationCode.length !== 6 || timeLeft === 0}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t("auth.emailVerification.verifying")}
                                    </>
                                ) : (
                                    t("auth.emailVerification.verify")
                                )}
                            </Button>

                            <div className="flex justify-between items-center pt-2">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-gray-500 hover:text-gray-700 text-sm p-0 h-auto"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    {t("auth.emailVerification.cancel")}
                                </Button>

                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-green-600 hover:text-green-700 text-sm p-0 h-auto flex items-center"
                                    onClick={handleResendCode}
                                    disabled={isResending || timeLeft > 0}
                                >
                                    {isResending ? (
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-1 h-3 w-3" />
                                    )}
                                    {t("auth.emailVerification.resendCode")}
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