// components/Footer.tsx
import Link from "next/link"
import { Leaf, Phone, Mail, MapPin, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/context/LanguageContext"

const Footer = () => {
    const { t, language, changeLanguage } = useLanguage();

    // Dil değiştirme fonksiyonu
    const toggleLanguage = () => {
        const newLanguage = language === "tr" ? "en" : "tr";
        changeLanguage(newLanguage);
    };

    return (
        <Card className="border-0 shadow-none rounded-none bg-green-50">
            <CardContent className="p-0">
                <footer className="w-full border-t py-6 md:py-12">
                    <div className="mx-auto px-4 md:px-6 max-w-7xl">
                        <div className="grid gap-8 lg:grid-cols-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Leaf className="h-6 w-6 text-green-600" />
                                    <span className="text-xl font-bold">EkoTaşıma</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("footer.description")}
                                </p>
                                {/* Dil değiştirme butonu */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                    onClick={toggleLanguage}
                                >
                                    <Globe className="h-4 w-4 mr-2" />
                                    {language === "tr" ? "English" : "Türkçe"}
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">{t("footer.quickLinks")}</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="#hero" className="text-sm hover:text-green-600 transition-colors">
                                            {t("navbar.home")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#about" className="text-sm hover:text-green-600 transition-colors">
                                            {t("navbar.about")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#services" className="text-sm hover:text-green-600 transition-colors">
                                            {t("navbar.services")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#contact" className="text-sm hover:text-green-600 transition-colors">
                                            {t("navbar.contact")}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">{t("footer.services")}</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            {t("services.items.0.title")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            {t("services.items.1.title")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            {t("services.items.2.title")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm hover:text-green-600 transition-colors">
                                            {t("services.items.4.title")}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">{t("footer.contact")}</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">+90 (212) 123 45 67</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">info@ekotasima.com</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Levent, İstanbul</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                                &copy; {new Date().getFullYear()} EkoTaşıma. {t("footer.copyright")}
                            </p>
                            <div className="flex gap-4">
                                <Link href="#" className="text-xs hover:text-green-600 transition-colors">
                                    {t("footer.privacyPolicy")}
                                </Link>
                                <Link href="#" className="text-xs hover:text-green-600 transition-colors">
                                    {t("footer.termsOfUse")}
                                </Link>
                                <Link href="#" className="text-xs hover:text-green-600 transition-colors">
                                    {t("footer.pdpl")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </CardContent>
        </Card>
    )
}

export default Footer