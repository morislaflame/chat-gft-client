import React from 'react';
import EmptyPage from '@/components/CoreComponents/EmptyPage';
import { useTranslate } from '@/utils/useTranslate';

export type SomethingWentWrongPageProps = {
    onRetry?: () => void;
    /** Переопределить текст кнопки (по умолчанию — tryAgain) */
    actionText?: string;
};

const SomethingWentWrongPage: React.FC<SomethingWentWrongPageProps> = ({ onRetry, actionText }) => {
    const { t } = useTranslate();

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
            return;
        }
        window.location.reload();
    };

    return (
        <div className="flex flex-1 min-h-0 w-full items-center justify-center">
            <EmptyPage
                icon="fas fa-triangle-exclamation"
                title={t('somethingWentWrongTitle')}
                description={t('somethingWentWrongDescription')}
                actionText={actionText ?? t('tryAgain')}
                onAction={handleRetry}
            />
        </div>
    );
};

export default SomethingWentWrongPage;
