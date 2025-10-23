// components/ContactSection.tsx
"use client"

import { Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/context/LanguageContext"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const ContactSection = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get('name'),
            lastName: formData.get('surname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };

        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: t("contact.form.successTitle") || "Başarılı!",
                description: t("contact.form.successMessage") || "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
            });

            // Reset form
            e.currentTarget.reset();
        } catch (error) {
            toast({
                title: t("contact.form.errorTitle") || "Hata!",
                description: t("contact.form.errorMessage") || "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-0 shadow-none bg-background">
            <CardContent className="p-0">
                <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
                    <div className="mx-auto px-4 md:px-6 max-w-7xl">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">
                                                {t("contact.subtitle")}
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                                {t("contact.title")}
                                            </h2>
                                            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                                                {t("contact.description")}
                                            </p>
                                        </div>
                                        <div className="space-y-4">

                                            <div className="flex items-start gap-4">
                                                <Mail className="h-6 w-6 text-green-600 mt-1" />
                                                <div>
                                                    <h3 className="font-bold">{t("contact.email")}</h3>
                                                    <p className="text-muted-foreground">info@transyuk.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <MapPin className="h-6 w-6 text-green-600 mt-1" />
                                                <div>
                                                    <h3 className="font-bold">{t("contact.address")}</h3>
                                                    <p className="text-muted-foreground">
                                                        Ankara, Türkiye
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-4">{t("contact.sendMessage")}</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="name"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {t("contact.form.firstName")}
                                                </label>
                                                <Input id="name" name="name" placeholder={t("contact.form.firstName")} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="surname"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {t("contact.form.lastName")}
                                                </label>
                                                <Input id="surname" name="surname" placeholder={t("contact.form.lastName")} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {t("contact.form.email")}
                                            </label>
                                            <Input id="email" name="email" type="email" placeholder={t("contact.form.email")} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="phone"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {t("contact.form.phone")}
                                            </label>
                                            <Input id="phone" name="phone" placeholder={t("contact.form.phone")} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="message"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {t("contact.form.message")}
                                            </label>
                                            <Textarea id="message" name="message" placeholder={t("contact.form.message")} className="min-h-[120px]" required />
                                        </div>
                                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                            {isSubmitting ? (t("contact.form.sending") || "Gönderiliyor...") : t("contact.form.submit")}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

export default ContactSection