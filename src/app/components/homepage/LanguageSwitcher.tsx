"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/context/LanguageContext"

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Dışarı tıklandığında dropdown'ı kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest("[data-language-switcher]")) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" data-language-switcher>
            <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-green-600"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change language"
            >
                <Globe className="h-5 w-5" />
                <span className="ml-2 font-medium">{language.toUpperCase()}</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                            className={`block px-4 py-2 text-sm w-full text-left ${
                                language === "tr" ? "bg-green-50 text-green-600 font-medium" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                                changeLanguage("tr");
                                setIsOpen(false);
                            }}
                            role="menuitem"
                        >
                            Türkçe
                        </button>
                        <button
                            className={`block px-4 py-2 text-sm w-full text-left ${
                                language === "en" ? "bg-green-50 text-green-600 font-medium" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                                changeLanguage("en");
                                setIsOpen(false);
                            }}
                            role="menuitem"
                        >
                            English
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;