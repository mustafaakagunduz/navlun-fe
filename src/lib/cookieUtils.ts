// src/lib/cookieUtils.ts
// Cookie yönetimi için helper fonksiyonlar

export const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof window === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
};

export const removeCookie = (name: string) => {
    if (typeof window === 'undefined') return;

    // Hem root path hem mevcut path için sil
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
};

export const clearAllAuthCookies = () => {
    removeCookie('accessToken');
    removeCookie('refreshToken');
    removeCookie('userEmail');

    // Extra güvenlik: tüm cookie'leri manuel sil
    if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            if (name === 'accessToken' || name === 'refreshToken' || name === 'userEmail') {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
            }
        }
    }
};
