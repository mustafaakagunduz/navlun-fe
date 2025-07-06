
export interface PageProps {
    params: Promise<{ [key: string]: string | string[] }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface LoadMessagingPageProps {
    params: Promise<{ loadId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Diğer specific page props'ları da ekleyebilirsiniz
export interface UserPageProps {
    params: Promise<{ userId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface OfferPageProps {
    params: Promise<{ offerId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}