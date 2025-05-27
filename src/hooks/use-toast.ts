"use client"

import { toast as reactToastify } from 'react-toastify';

interface ToastProps {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

export function toast({ title, description, variant = 'default' }: ToastProps) {
    const message = title && description ? `${title}: ${description}` : title || description || '';

    if (variant === 'destructive') {
        reactToastify.error(message, {
            className: '!bg-red-50 !text-red-900 !border-red-200',
            progressClassName: '!bg-red-500'
        });
    } else {
        reactToastify.success(message, {
            className: '!bg-green-50 !text-green-900 !border-green-200',
            progressClassName: '!bg-green-500'
        });
    }
}

export function useToast() {
    return {
        toast,
        dismiss: (toastId?: string) => {
            if (toastId) {
                reactToastify.dismiss(toastId);
            } else {
                reactToastify.dismiss();
            }
        }
    };
}