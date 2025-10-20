"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Truck, Users } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import authService from "@/services/authService"
import { useAuth } from "@/context/AuthContext"

function SelectRoleContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()
    const { toast } = useToast()
    const { setUser } = useAuth()

    const [selectedRole, setSelectedRole] = useState<'SENDER' | 'CARRIER' | 'BROKER'>('SENDER')
    const [isLoading, setIsLoading] = useState(false)

    const roleOptions = [
        {
            value: 'SENDER' as const,
            label: t("auth.sender") || "Gönderici",
            description: "Yük göndermek istiyorum",
            icon: Package
        },
        {
            value: 'CARRIER' as const,
            label: t("auth.carrier") || "Taşıyıcı",
            description: "Yük taşımak istiyorum",
            icon: Truck
        },
        {
            value: 'BROKER' as const,
            label: t("auth.broker") || "Aracı",
            description: "Aracılık yapmak istiyorum",
            icon: Users
        }
    ]

    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            const token = searchParams.get('token') || localStorage.getItem('accessToken')
            const userId = searchParams.get('userId') || localStorage.getItem('userId')

            if (!token || !userId) {
                toast({
                    title: "Hata",
                    description: "Oturum bilgileri bulunamadı. Lütfen tekrar giriş yapın.",
                    variant: "destructive"
                })
                router.push('/login')
                return
            }

            // Backend'e role bilgisini gönder ve güncellenen user bilgilerini al
            const response = await authService.updateRole(selectedRole)

            // Eğer response'da yeni token'lar varsa, localStorage'ı güncelle
            if (response.accessToken && response.refreshToken) {
                localStorage.setItem('accessToken', response.accessToken)
                localStorage.setItem('refreshToken', response.refreshToken)
            }

            // Context'i güncelle
            setUser({
                id: response.id,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                role: response.role,
                emailVerified: true
            })

            // Başarılı olduysa dashboard'a yönlendir
            toast({
                title: "Başarılı",
                description: "Hesap türünüz başarıyla ayarlandı.",
            })

            router.push('/dashboard')
        } catch (error) {
            console.error('Role update error:', error)
            toast({
                title: "Hata",
                description: "Hesap türü ayarlanırken bir hata oluştu.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
            <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="p-8 pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-900 text-center">
                        Hesap Türünüzü Seçin
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-center text-base font-medium mt-2">
                        Devam etmek için lütfen hesap türünüzü belirleyin
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-2">
                    <div className="space-y-6">
                        <RadioGroup
                            value={selectedRole}
                            onValueChange={(value) => setSelectedRole(value as 'SENDER' | 'CARRIER' | 'BROKER')}
                            className="space-y-4"
                        >
                            {roleOptions.map(role => {
                                const Icon = role.icon
                                const isSelected = selectedRole === role.value
                                return (
                                    <div
                                        key={role.value}
                                        className={`relative flex items-start p-6 bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                            isSelected
                                                ? 'border-green-500 shadow-lg shadow-green-100'
                                                : 'border-gray-200 hover:border-green-200'
                                        }`}
                                        onClick={() => setSelectedRole(role.value)}
                                    >
                                        <RadioGroupItem
                                            value={role.value}
                                            id={role.value.toLowerCase()}
                                            className="mt-1 text-green-600"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    isSelected ? 'bg-green-100' : 'bg-gray-100'
                                                }`}>
                                                    <Icon className={`h-6 w-6 ${
                                                        isSelected ? 'text-green-600' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <Label
                                                        htmlFor={role.value.toLowerCase()}
                                                        className={`cursor-pointer font-semibold text-lg ${
                                                            isSelected ? 'text-green-700' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {role.label}
                                                    </Label>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {role.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </RadioGroup>

                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                'Devam Et'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SelectRolePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Yükleniyor...</h2>
                    </div>
                </div>
            </div>
        }>
            <SelectRoleContent />
        </Suspense>
    )
}
