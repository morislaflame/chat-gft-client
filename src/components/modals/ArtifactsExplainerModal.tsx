import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import GemsInfoModal from '@/components/modals/GemsInfoModal';

export type ArtifactsExplainerModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ArtifactsExplainerModal: React.FC<ArtifactsExplainerModalProps> = observer(({ isOpen, onClose }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [gemsInfoOpen, setGemsInfoOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) setGemsInfoOpen(false);
    }, [isOpen]);

    const handleClose = () => {
        hapticImpact('soft');
        onClose();
    };

    const openGemsInfo = () => {
        hapticImpact('soft');
        setGemsInfoOpen(true);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            closeAriaLabel={t('close')}
            title={t('artifactsExplainerTitle')}
            description={t('artifactsExplainerSubtitle')}
            footer={
                <Button onClick={handleClose} variant="gradient" size="lg" className="w-full">
                    {t('gotIt')}
                </Button>
            }
            contentClassName="max-h-[min(50vh,380px)]"
        >
            <div className="text-zinc-200 text-md leading-relaxed space-y-2 list-disc pl-2">
                <p>
                    - {t('artifactsExplainerP1BeforeGems')}
                    <button
                        type="button"
                        onClick={openGemsInfo}
                        className="text-secondary-gradient font-semibold underline-offset-2 hover:underline cursor-pointer bg-transparent border-0 p-0 inline align-baseline"
                        aria-label={t('gemsInfoTitle')}
                    >
                        {t('gems')}
                    </button>
                    {t('artifactsExplainerP1AfterGems')}
                </p>
                <p>- {t('artifactsExplainerP2')}</p>
                <p>- {t('artifactsExplainerP3')}</p>
            </div>

            <GemsInfoModal isOpen={gemsInfoOpen} onClose={() => setGemsInfoOpen(false)} />
        </Modal>
    );
});

export default ArtifactsExplainerModal;
