"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function OAuth2CallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setUser } = useAuth()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleOAuth2Callback = async () => {
            try {
                // URL'den token'ları al
                const token = searchParams.get('token')
                const refreshToken = searchParams.get('refreshToken')
                const userId = searchParams.get('userId')
                const email = searchParams.get('email')
                const errorParam = searchParams.get('error')

                // Hata varsa göster
                if (errorParam) {
                    setError(errorParam)
                    setTimeout(() => {
                        router.push('/login')
                    }, 3000)
                    return
                }

                // Token'lar yoksa hata
                if (!token || !refreshToken || !userId || !email) {
                    setError('OAuth2 authentication bilgileri eksik')
                    setTimeout(() => {
                        router.push('/login')
                    }, 3000)
                    return
                }

                // Token'ları localStorage'a kaydet
                localStorage.setItem('accessToken', token)
                localStorage.setItem('refreshToken', refreshToken)
                localStorage.setItem('userId', userId)
                localStorage.setItem('userEmail', email)

                // User bilgilerini al ve context'e set et
                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
                    const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.success && data.data) {
                            setUser(data.data)
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch user data:', err)
                    // User bilgilerini alamasak bile token'lar var, dashboard'a yönlendir
                }

                // Dashboard'a yönlendir
                router.push('/dashboard')
            } catch (err) {
                console.error('OAuth2 callback error:', err)
                setError('Giriş işlemi sırasında bir hata oluştu')
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            }
        }

        handleOAuth2Callback()
    }, [searchParams, router, setUser])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Giriş yapılıyor...</h2>
                    <p className="text-gray-600">Lütfen bekleyin, hesabınıza giriş yapıyoruz.</p>
                </div>
            </div>
        </div>
    )
}
