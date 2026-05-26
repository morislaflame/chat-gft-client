import React from 'react';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

export type ProfileNftArtifactsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ProfileNftArtifactsModal: React.FC<ProfileNftArtifactsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();

    const handleClose = () => {
        hapticImpact('soft');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            closeAriaLabel={t('close')}
            title={t('profileNftArtifactsBannerTitle')}
            description={t('profileNftInfoModalSubtitle')}
            footer={
                <Button onClick={handleClose} variant="gradient" size="lg" className="w-full">
                    {t('gotIt')}
                </Button>
            }
            contentClassName="max-h-[min(55vh,420px)]"
        >
            <div className="list-none space-y-2 pl-2 text-[15px] leading-relaxed text-zinc-200">
                <p>- {t('profileNftInfoModalP1')}</p>
                <p>- {t('profileNftInfoModalP2')}</p>
                <p>- {t('profileNftInfoModalP3')}</p>
            </div>
        </Modal>
    );
};

export default ProfileNftArtifactsModal;
