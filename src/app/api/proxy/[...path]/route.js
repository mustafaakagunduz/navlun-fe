import { NextResponse } from 'next/server';
import axiosInstance from '@/lib/axios';

export async function GET(request, { params }) {
    return handleRequest(request, 'GET', params.path);
}

export async function POST(request, { params }) {
    return handleRequest(request, 'POST', params.path);
}

export async function PUT(request, { params }) {
    return handleRequest(request, 'PUT', params.path);
}

export async function DELETE(request, { params }) {
    return handleRequest(request, 'DELETE', params.path);
}

export async function PATCH(request, { params }) {
    return handleRequest(request, 'PATCH', params.path);
}

// Common proxy routing function
/**
 * İstek işleme fonksiyonu - client tarafından gelen istekleri backend'e yönlendirir
 *
 * @param {Request} request - Next.js istek nesnesi
 * @param {string} method - HTTP metodu (GET, POST, PUT, DELETE, PATCH)
 * @param {string[]} paths - URL yol segmentleri
 * @returns {Promise<NextResponse>} - NextResponse nesnesi
 */
async function handleRequest(request, method, paths) {
    try {
        // URL yolunu oluştur
        const pathSegment = paths.join('/');

        // Query parametrelerini al
        const searchParams = request.nextUrl.searchParams;
        const queryParams = {};

        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });

        // İstek gövdesini al (POST, PUT, PATCH için)
        let requestBody = null;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            requestBody = await request.json().catch(() => ({}));
        }

        // Authorization header'ını al ve aktar
        const headers = {};
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Content-Type header'ını ayarla (multipart/form-data hariç)
        const contentType = request.headers.get('Content-Type');
        if (contentType && !contentType.includes('multipart/form-data')) {
            headers['Content-Type'] = contentType;
        } else if (!contentType) {
            headers['Content-Type'] = 'application/json';
        }

        // Diğer önemli header'ları aktar
        const acceptHeader = request.headers.get('Accept');
        if (acceptHeader) {
            headers['Accept'] = acceptHeader;
        }

        // Canlı ortamda gerekli olabilecek CORS, cache ve diğer header'lar
        // burada eklenebilir

        // Backend API'ye istek at
        const response = await axiosInstance({
            method: method.toLowerCase(),
            url: `/${pathSegment}`,
            params: queryParams,
            data: requestBody,
            headers,
            // İçerik büyükse veya form dosyası yükleniyorsa timeout'u uzat
            timeout: contentType?.includes('multipart/form-data') ? 60000 : 15000,
        });

        // API yanıtını döndür
        // Eğer yanıt özel bir işleme tabi tutulacaksa (önbelleğe alma vb.) buraya eklenebilir
        return NextResponse.json(response.data, {
            status: response.status,
            headers: {
                // Backend'den gelen bazı önemli header'ları istemciye aktar
                ...(response.headers['cache-control'] && {
                    'Cache-Control': response.headers['cache-control']
                }),
                ...(response.headers['content-type'] && {
                    'Content-Type': response.headers['content-type']
                }),
            }
        });
    } catch (error) {
        console.error(`Error in ${method} /${paths.join('/')}:`, error);

        // Hata yanıtını hazırla
        const errorStatus = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || 'API request failed';
        const errorData = error.response?.data || { error: errorMessage };

        // Üretim ortamında hata mesajlarını filtreleme
        // 500 hatalarında kullanıcıya aşırı teknik detay gösterme
        const safeErrorData = process.env.NODE_ENV === 'production' && errorStatus >= 500
            ? { error: 'Internal server error occurred. Please try again later.' }
            : errorData;

        // Hata yanıtını döndür
        return NextResponse.json(safeErrorData, { status: errorStatus });
    }
}