/**
 * Rate Limiting Utility for Next.js API Routes
 * Redis ile rate limiting implementation
 */

import { incrementKey, setExpiration, getFromCache } from './redis';

interface RateLimitOptions {
  maxRequests: number; // Maksimum istek sayısı
  windowSeconds: number; // Zaman penceresi (saniye)
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit kontrolü yap
 *
 * @param identifier - Client identifier (IP, user ID, etc.)
 * @param options - Rate limit ayarları
 * @returns Rate limit sonucu
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 100, windowSeconds: 60 }
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;

  try {
    // Mevcut request sayısını artır
    const currentCount = await incrementKey(key);

    if (currentCount === null) {
      // Redis hatası, güvenlik için rate limit uygula
      return {
        success: false,
        limit: options.maxRequests,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + options.windowSeconds,
      };
    }

    // İlk request ise TTL set et
    if (currentCount === 1) {
      await setExpiration(key, options.windowSeconds);
    }

    // Kalan request sayısı
    const remaining = Math.max(0, options.maxRequests - currentCount);

    // Reset time
    const reset = Math.floor(Date.now() / 1000) + options.windowSeconds;

    return {
      success: currentCount <= options.maxRequests,
      limit: options.maxRequests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Hata durumunda güvenli tarafta kal, rate limit uygula
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + options.windowSeconds,
    };
  }
}

/**
 * IP adresinden client identifier oluştur
 * Next.js headers'tan IP al
 */
export function getClientIdentifier(request: Request): string {
  // X-Forwarded-For header'ından IP al (proxy arkasında çalışıyorsa)
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    // İlk IP'yi al
    return forwardedFor.split(',')[0].trim();
  }

  // X-Real-IP header'ı
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback - random identifier (development için)
  return 'unknown-client';
}

/**
 * Rate limit middleware for API routes
 * Next.js API route'larında kullanım için
 *
 * Örnek kullanım:
 * ```typescript
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimitMiddleware(request);
 *   if (!rateLimitResult.success) {
 *     return new Response(JSON.stringify({ error: 'Too many requests' }), {
 *       status: 429,
 *       headers: rateLimitResult.headers,
 *     });
 *   }
 *   // Normal işlem devam eder...
 * }
 * ```
 */
export async function rateLimitMiddleware(
  request: Request,
  options?: RateLimitOptions
): Promise<{ success: boolean; headers: Record<string, string> }> {
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, options);

  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  return {
    success: result.success,
    headers,
  };
}
