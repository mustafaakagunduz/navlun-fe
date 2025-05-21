// /components/auth/forms/FormInput.tsx
"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { FormInputProps } from "./types"
import { styleClasses } from "./styles"

const FormInput = ({
                       id,
                       name,
                       type = "text",
                       placeholder,
                       value,
                       onChange,
                       icon,
                       label,
                       error,
                       rightIcon = null
                   }: FormInputProps) => (
    <div className="space-y-2">
        <Label htmlFor={id} className={styleClasses.label}>{label}</Label>
        <div className={styleClasses.inputContainer}>
            {icon}
            <Input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`${styleClasses.input} ${error ? styleClasses.inputError : ""}`}
                autoComplete="on"
                spellCheck="false"
            />
            {rightIcon && (
                <div className="absolute right-3 top-3.5">
                    {rightIcon}
                </div>
            )}
        </div>
        {error && (
            <p className={styleClasses.error}>
                <AlertCircle className={styleClasses.errorIcon} />
                {error}
            </p>
        )}
    </div>
)

export default FormInput