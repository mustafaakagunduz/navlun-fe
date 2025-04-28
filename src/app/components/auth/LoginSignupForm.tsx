// components/LoginSignupForm.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useLanguage } from "@/app/context/LanguageContext"

const LoginSignupForm = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ email: "", password: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (type: "login" | "signup") => {
        console.log(`${type} ->`, formData)
    }

    return (
        <Tabs defaultValue="login" className="w-full max-w-sm mx-auto">
            <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
                <form className="space-y-4">
                    <Input
                        type="email"
                        name="email"
                        placeholder={t("auth.email")}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        type="password"
                        name="password"
                        placeholder={t("auth.password")}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button className="w-full bg-green-600 hover:bg-green-700" type="button" onClick={() => handleSubmit("login")}>
                        {t("auth.login")}
                    </Button>
                </form>
            </TabsContent>

            <TabsContent value="signup">
                <form className="space-y-4">
                    <Input
                        type="email"
                        name="email"
                        placeholder={t("auth.email")}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        type="password"
                        name="password"
                        placeholder={t("auth.password")}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button className="w-full bg-green-600 hover:bg-green-700" type="button" onClick={() => handleSubmit("signup")}>
                        {t("auth.signup")}
                    </Button>
                </form>
            </TabsContent>
        </Tabs>
    )
}

export default LoginSignupForm
