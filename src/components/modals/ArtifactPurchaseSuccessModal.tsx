import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { ProfileInventoryArtifact } from '@/types/types';
import { getArtifactBackdropSrcByBoostType } from '@/utils/rewardBackdrop';
import { FireworksBackground } from '@/components/ui/backgrounds/fireworks-background';

export type ArtifactPurchaseSuccessModalProps = {
    isOpen: boolean;
    artifact: ProfileInventoryArtifact | null;
    title: string;
    ownedQty: number;
    onClose: () => void;
};

const ArtifactPurchaseSuccessModal: React.FC<ArtifactPurchaseSuccessModalProps> = observer(
    ({ isOpen, artifact, title, ownedQty, onClose }) => {
        const { t } = useTranslate();
        const { hapticImpact, hapticNotification } = useHapticFeedback();
        const [fireworksPlaying, setFireworksPlaying] = useState(false);
        const [fireworksKey, setFireworksKey] = useState(0);

        useEffect(() => {
            if (!isOpen) {
                setFireworksPlaying(false);
                return;
            }
            hapticNotification('success');
            setFireworksKey((k) => k + 1);
            setFireworksPlaying(true);
        }, [isOpen, hapticNotification]);

        const handleClose = () => {
            hapticImpact('soft');
            onClose();
        };

        const onFireworksComplete = useCallback(() => {
            setFireworksPlaying(false);
        }, []);

        const previewUrl = artifact?.media?.url;
        const previewMime = artifact?.media?.mimeType ?? '';
        const isImage = Boolean(previewUrl && previewMime.startsWith('image/'));

        return (
            <>
                {typeof document !== 'undefined' && isOpen && fireworksPlaying ? createPortal(
                    <div className="fixed inset-0 z-[10002] pointer-events-none">
                        <FireworksBackground
                            key={fireworksKey}
                            className="absolute inset-0"
                            particleCount={70}
                            transparent
                            burstCount={5}
                            onBurstComplete={onFireworksComplete}
                        />
                    </div>,
                    document.body,
                ) : null}

                <Modal
                    isOpen={isOpen}
                    onClose={handleClose}
                    closeOnOverlayClick={false}
                    swipeToClose={false}
                    hideCloseButton
                    backdropImageSrc={
                        artifact ? getArtifactBackdropSrcByBoostType(artifact.boostType) : undefined
                    }
                    title={t('artifactPurchaseSuccessTitle')}
                    description={t('artifactPurchaseSuccessSubtitle')}
                    headerIcon={<i className="fa-solid fa-bag-shopping text-white text-2xl" />}
                    headerIconContainerClassName="bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/30"
                    footer={
                        <Button
                            onClick={handleClose}
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            icon="fa-solid fa-check"
                        >
                            {t('artifactAcquiredContinue')}
                        </Button>
                    }
                >
                    {artifact ? (
                        <div className="flex flex-col items-center gap-4 px-2 pb-2">
                            <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border btn-default-silver-border">
                                {isImage ? (
                                    <img
                                        src={previewUrl}
                                        alt=""
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <i className="fa-solid fa-gem text-6xl text-amber-400/90" />
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-white">{title}</p>
                                {ownedQty > 1 ? (
                                    <p className="mt-1 text-sm text-zinc-400">
                                        {t('artifactInInventory')}: {ownedQty}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </Modal>
            </>
        );
    },
);

export default ArtifactPurchaseSuccessModal;
