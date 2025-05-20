// src/utils/authUtils.ts
import { User } from "@/services/userService";

// Kullanıcının rolünü kontrol eder
export const hasRole = (user: User | null, requiredRoles: ('ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER')[]): boolean => {
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

// BROKER rolüne sahip mi kontrolü - yeni eklenen fonksiyon
export const isBroker = (user: User | null): boolean => {
    return user?.role === 'BROKER';
};