"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface LanguageContextType {
    language: string;
    changeLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>("tr");
    const [translations, setTranslations] = useState<any>({});

    useEffect(() => {
        // Browser diline göre başlangıç dilini ayarla
        const browserLang = navigator.language.split("-")[0];
        const initialLang = browserLang === "en" ? "en" : "tr";
        setLanguage(initialLang);

        // LocalStorage'dan dil tercihini kontrol et
        const storedLang = localStorage.getItem("language");
        if (storedLang && (storedLang === "en" || storedLang === "tr")) {
            setLanguage(storedLang);
        }
    }, []);

    useEffect(() => {
        // Dil değiştiğinde çevirileri yükle
        const loadTranslations = async () => {
            try {
                const response = await fetch(`/locales/${language}.json`);
                const data = await response.json();
                setTranslations(data);
                // Dil tercihini localStorage'a kaydet
                localStorage.setItem("language", language);
                // HTML lang özelliğini güncelle
                document.documentElement.lang = language;
            } catch (error) {
                console.error("Translation loading error:", error);
            }
        };

        loadTranslations();
    }, [language]);

    const changeLanguage = (lang: string) => {
        if (lang === "en" || lang === "tr") {
            setLanguage(lang);
        }
    };

    // Çeviri fonksiyonu
    const t = (key: string): string => {
        if (!translations) return key;

        // Nokta notasyonuyla iç içe nesne özelliklerine erişim
        const keys = key.split(".");
        let result = translations;

        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                return key; // Çeviri bulunamazsa anahtarı döndür
            }
        }

        return typeof result === "string" ? result : key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook kullanımı için
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};