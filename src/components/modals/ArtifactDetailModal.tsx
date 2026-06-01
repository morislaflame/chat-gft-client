import React from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { ProfileInventoryArtifact } from '@/types/types';
import { getArtifactBackdropSrcByBoostType } from '@/utils/rewardBackdrop';
import Button from '../ui/button';
import ArtifactMarketActions, {
    type ArtifactTradeSuccessPayload,
} from '@/components/ProfilePageComponents/ArtifactMarketActions';

type ArtifactDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    artifact: ProfileInventoryArtifact | null;
    /** Локализованное имя для заголовка */
    title: string;
    /** Локализованное описание (передаётся снаружи) */
    description: string;
    ownedQty: number;
    isOwned: boolean;
    levelUnlocked: boolean;
    unlockedLevels?: number[];
    historyName: string;
    userBalance: number;
    onTradeSuccess: (payload: ArtifactTradeSuccessPayload) => void;
};

const ArtifactDetailModal: React.FC<ArtifactDetailModalProps> = observer(
    ({
        isOpen,
        onClose,
        artifact,
        title,
        description,
        ownedQty,
        isOwned,
        levelUnlocked,
        unlockedLevels,
        historyName,
        userBalance,
        onTradeSuccess,
    }) => {
        const { t } = useTranslate();
        const { hapticImpact } = useHapticFeedback();

        const handleClose = () => {
            hapticImpact('soft');
            onClose();
        };

        const previewUrl = artifact?.media?.url;
        const previewMime = artifact?.media?.mimeType ?? '';
        const isImage = Boolean(previewUrl && previewMime.startsWith('image/'));
        const descriptionTrimmed = description.trim();
        const modalDescription = isOwned
            ? descriptionTrimmed
                ? descriptionTrimmed
                : undefined
            : t('artifactNotInInventoryBody');

        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                closeOnOverlayClick={true}
                backdropImageSrc={
                    artifact ? getArtifactBackdropSrcByBoostType(artifact.boostType) : undefined
                }
                title={title}
                description={modalDescription}
                closeAriaLabel={t('close')}
                contentClassName="max-h-[min(55vh,420px)] overflow-y-auto"
                footer={
                    <div className="flex w-full flex-col gap-2">
                        {artifact ? (
                            <ArtifactMarketActions
                                artifact={artifact}
                                historyName={historyName}
                                ownedQty={ownedQty}
                                userBalance={userBalance}
                                levelUnlocked={levelUnlocked}
                                unlockedLevels={unlockedLevels}
                                layout="modal"
                                onSuccess={onTradeSuccess}
                                isOwned={isOwned}
                            />
                        ) : null}
                        <Button onClick={handleClose} variant="default" size="lg" className="w-full">
                            {t('close')}
                        </Button>
                    </div>
                }
            >
                {artifact ? (
                    <div className="flex flex-col gap-4 px-1 pb-4">
                        <div className="flex justify-center">
                            <div className="relative w-44 h-44 flex items-center justify-center rounded-xl border btn-default-silver-border overflow-hidden">
                                {isImage ? (
                                    <img
                                        src={previewUrl}
                                        alt=""
                                        className={`max-w-full max-h-full object-contain ${
                                            isOwned ? '' : 'grayscale brightness-[0.72] contrast-[0.92]'
                                        }`}
                                    />
                                ) : (
                                    <div className="relative flex h-full w-full items-center justify-center">
                                        <i
                                            className={`fa-solid fa-gem text-6xl ${
                                                isOwned ? 'text-amber-400/90' : 'text-zinc-600 opacity-80 grayscale'
                                            }`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {isOwned && !descriptionTrimmed ? (
                            <p className="text-zinc-500 text-sm italic text-center">{t('artifactNoDescription')}</p>
                        ) : null}
                    </div>
                ) : null}
            </Modal>
        );
    },
);

export default ArtifactDetailModal;
