"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/context/LanguageContext"

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    // Dil değiştirme fonksiyonu - direkt değiştiriyor
    const toggleLanguage = () => {
        const newLanguage = language === "tr" ? "en" : "tr";
        changeLanguage(newLanguage);
    };

    return (
        <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={toggleLanguage}
        >
            <Globe className="h-4 w-4 mr-2" />
            {language === "tr" ? "English" : "Türkçe"}
        </Button>
    );
};

export default LanguageSwitcher;