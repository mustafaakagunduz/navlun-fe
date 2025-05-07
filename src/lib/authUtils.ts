// src/utils/authUtils.ts
import { User} from "@/app/services/authService";

// Kullanıcının rolünü kontrol eder
export const hasRole = (user: User | null, requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
};

// SENDER rolüne sahip mi kontrolü
export const isSender = (user: User | null): boolean => {
    return user?.role === 'SENDER';
};

// CARRIER rolüne sahip mi kontrolü
export const isCarrier = (user: User | null): boolean => {
    return user?.role === 'CARRIER';
};

// ADMIN rolüne sahip mi kontrolü
export const isAdmin = (user: User | null): boolean => {
    return user?.role === 'ADMIN';
};