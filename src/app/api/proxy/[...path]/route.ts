import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';

// Tüm HTTP metodlarını işle
export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, 'GET', params.path);
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, 'POST', params.path);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, 'PUT', params.path);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, 'DELETE', params.path);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleRequest(request, 'PATCH', params.path);
}

// İstek yönlendirme işleyicisi
async function handleRequest(
    request: NextRequest,
    method: string,
    paths: string[]
) {
    try {
        // URL yolunu oluştur
        const pathSegment = paths.join('/');

        // Query parametrelerini al
        const searchParams = request.nextUrl.searchParams;
        const queryParams: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });

        // İstek gövdesini al (POST, PUT, PATCH için)
        let requestBody = null;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            requestBody = await request.json().catch(() => ({}));
        }

        // Backend API'ye istek at
        const response = await axiosInstance({
            method: method.toLowerCase(),
            url: `/${pathSegment}`,
            params: queryParams,
            data: requestBody
        });

        // API yanıtını döndür
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error(`Error in ${method} /${paths.join('/')}:`, error);

        // Hata yanıtını döndür
        return NextResponse.json(
            { error: error.response?.data || error.message || 'API request failed' },
            { status: error.response?.status || 500 }
        );
    }
}

// Canlıya alırken dikkate alınması gereken notlar:
/*
 * 1. Güvenlik Kontrolleri:
 *    - Bu genel proxy route, tüm API yollarına erişim sağlar.
 *    - Yetkilendirme kontrollerini backend'de doğru şekilde yapın.
 *    - Gerekirse, hassas endpoint'lere erişimi kısıtlamak için burada ek kontroller ekleyin.
 *
 * 2. Ortam Değişkenleri:
 *    - NEXT_PUBLIC_API_URL değişkenini her ortam için doğru yapılandırın.
 *
 * 3. Hata İşleme ve Logging:
 *    - Prod ortamında detaylı hata mesajlarını gizlemeyi düşünün.
 *    - Kritik hataları izlemek için bir logging sistemi entegre edin.
 *
 * 4. Performans Optimizasyonu:
 *    - Çok kullanılan endpoint'ler için caching ekleyin.
 */