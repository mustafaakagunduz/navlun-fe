"use client"

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function BackgroundImage() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Sadece ana sayfada ve login olmamış kullanıcılar için göster
    const shouldShowBackground = pathname === "/" && !user;

    if (!shouldShowBackground) return null;

    return (
        <div className="fixed inset-0 z-0">
            <Image
                src="/assets/images/eco-trans.webp"
                alt="Ekolojik taşımacılık - Otoyolda kamyonlar"
                fill
                className="object-cover object-center"
                priority
                quality={90}
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
    );
}