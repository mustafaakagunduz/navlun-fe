// src/utils/formatters.ts
export const formatDate = (dateString: string | number[]) => {
    if (Array.isArray(dateString)) {
        const [year, month, day] = dateString;
        return new Date(year, month - 1, day).toLocaleDateString('tr-TR');
    }
    return new Date(dateString).toLocaleDateString('tr-TR');
};

export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount);
};

export const formatWeight = (weight: number) => {
    if (weight >= 1000) {
        return `${(weight / 1000).toFixed(1)} ton`;
    }
    return `${weight} kg`;
};

export const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes} dakika`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} saat`;
    }
    return `${hours} saat ${remainingMinutes} dakika`;
};

export const formatDistance = (kilometers: number) => {
    if (kilometers < 1) {
        return `${(kilometers * 1000).toFixed(0)} metre`;
    }
    return `${kilometers.toFixed(1)} km`;
};