// src/app/dashboard/messages/load/[loadId]/page.tsx
import { LoadMessagingPageProps } from '@/types/next';
import LoadMessagingContent from './LoadMessagingContent';

export default async function LoadMessagingPage({ params }: LoadMessagingPageProps) {
    const { loadId } = await params;

    return <LoadMessagingContent loadId={loadId} />;
}