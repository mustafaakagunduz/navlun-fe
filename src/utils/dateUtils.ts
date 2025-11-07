/**
 * Date utility fonksiyonları
 * Backend'den gelen tarih formatlarını düzgün şekilde handle eder
 */

/**
 * Tarih string'ini veya array'ini parse eder ve geçerli bir Date objesi döner
 */
export function parseDate(dateInput: string | number[] | null | undefined): Date | null {
    if (!dateInput) return null;

    try {
        // Eğer array ise (Java LocalDateTime formatı: [year, month, day, hour, minute, second, nano])
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
            // JavaScript Date month'u 0-indexed (0=January), Java 1-indexed (1=January)
            const date = new Date(year, month - 1, day, hour, minute, second);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date array:', dateInput);
                return null;
            }
            return date;
        }

        // String ise normal parse
        const date = new Date(dateInput);
        // Invalid date kontrolü
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateInput);
            return null;
        }
        return date;
    } catch (error) {
        console.error('Error parsing date:', dateInput, error);
        return null;
    }
}

/**
 * Tarih ve saat formatlar (örn: "07.11.2025 14:30")
 */
export function formatDateTime(dateInput: string | number[] | null | undefined): string {
    const date = parseDate(dateInput);
    if (!date) return 'Tarih bilgisi yok';

    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Sadece tarih formatlar (örn: "07.11.2025")
 */
export function formatDate(dateInput: string | number[] | null | undefined): string {
    const date = parseDate(dateInput);
    if (!date) return 'Tarih bilgisi yok';

    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

/**
 * Sadece saat formatlar (örn: "14:30")
 */
export function formatTime(dateInput: string | number[] | null | undefined): string {
    const date = parseDate(dateInput);
    if (!date) return 'Saat bilgisi yok';

    return new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Göreli zaman formatlar (örn: "5 dakika önce", "2 saat önce")
 */
export function formatRelativeTime(dateInput: string | number[] | null | undefined): string {
    const date = parseDate(dateInput);
    if (!date) return 'Tarih bilgisi yok';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Az önce';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} dakika önce`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} saat önce`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} gün önce`;
    } else {
        return formatDateTime(dateInput);
    }
}

/**
 * Uzun format (örn: "7 Kasım 2025, Perşembe 14:30")
 */
export function formatLongDateTime(dateInput: string | number[] | null | undefined): string {
    const date = parseDate(dateInput);
    if (!date) return 'Tarih bilgisi yok';

    return new Intl.DateTimeFormat('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * İki tarih arasındaki farkı hesaplar
 */
export function getDateDifference(
    startDate: string | number[] | null | undefined,
    endDate: string | number[] | null | undefined
): { days: number; hours: number; minutes: number } | null {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) return null;

    const diffInMs = end.getTime() - start.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    return {
        days: diffInDays,
        hours: diffInHours % 24,
        minutes: diffInMinutes % 60
    };
}

/**
 * Tarih geçerli mi kontrol eder
 */
export function isValidDate(dateInput: string | number[] | null | undefined): boolean {
    const date = parseDate(dateInput);
    return date !== null;
}
