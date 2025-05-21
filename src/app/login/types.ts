// /components/auth/forms/types.ts
export type FormErrorsType = Record<string, string>

export type SignupFormType = {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    role: 'SENDER' | 'CARRIER' | 'BROKER'
}

export type LoginFormType = {
    email: string
    password: string
}

export type FormInputProps = {
    id: string
    name: string
    type?: string
    placeholder: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    icon: React.ReactNode
    label: string
    error?: string
    rightIcon?: React.ReactNode | null
}

export type LoginFormProps = {
    loginData: LoginFormType
    formErrors: FormErrorsType
    isLoading: boolean
    handleLoginChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleLoginSubmit: (e: React.FormEvent) => void
    toggleResetMode: () => void
    t: (key: string) => string
}

export type SignupFormProps = {
    signupData: SignupFormType
    formErrors: FormErrorsType
    isLoading: boolean
    passwordsMatch: boolean
    handleSignupChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleRoleChange: (value: 'SENDER' | 'CARRIER' | 'BROKER') => void
    handleSignupSubmit: (e: React.FormEvent) => void
    t: (key: string) => string
}

export type ResetFormProps = {
    resetEmail: string
    formErrors: FormErrorsType
    isLoading: boolean
    resetSuccess: boolean
    handleResetEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleResetSubmit: (e: React.FormEvent) => void
    toggleResetMode: () => void
    t: (key: string) => string
}